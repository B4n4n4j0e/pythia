from pythia import api, db
from flask_restful import Resource, fields, marshal_with, abort, reqparse, marshal
from flask import request, current_app
from pythia.models import *
import sqlite3
import subprocess
import re
from sqlalchemy import and_, or_, desc, func, literal_column, types, asc
from sqlalchemy.sql import func, expression
import copy
import os
from werkzeug.utils import secure_filename
import json

ALLOWED_EXTENSIONS = {'pcap'}
PORTS_OF_INTEREST = ["10/tcp", "21/tcp", "22/tcp", "23/tcp", "25/tcp", "80/tcp", "110/tcp", "139/tcp", "443/tcp",
                     "445/tcp", "3389/tcp", "10/udp", "53/udp",
                     "67/udp", "123/udp", "135/udp", "137/udp", "138/udp", "161/udp", "445/udp", "631/udp", "1434/udp"]
dns_resource_fields = {
    'ts': fields.Float(attribute='connection.ts'),
    'uid': fields.String,
    'query_text': fields.String,
    'q_answers': fields.String,
    'q_type': fields.String,
    'q_rcode': fields.String,
    'source': fields.String(attribute='connection.source'),
    'target': fields.String(attribute='connection.target')
}

dns_resources_fields = {
    'dNSConnections': fields.Nested(dns_resource_fields),
    'total': fields.Integer
}

connection_resource_fields = {
    'ts': fields.Float,
    'uid': fields.String,
    'source': fields.String(attribute='source'),
    'orig_p': fields.String,
    'target': fields.String(attribute='target'),
    'resp_p': fields.String,
    'proto': fields.String,
    'service': fields.String,
    'duration': fields.Float,
    'orig_ip_bytes': fields.Float,
    'resp_ip_bytes': fields.Float
}


connections_resource_fields = {
    'connections': fields.Nested(connection_resource_fields),
    'total': fields.Integer
}


notice_resource_fields = {
    'ts': fields.Float,
    'notice_uid': fields.String,
    'notice_source': fields.String(attribute='connection.source'),
    'notice_target': fields.String(attribute='connection.target'),
    'note': fields.String,
    'msg': fields.String
}

notices_resource_fields  = {
    'notices': fields.Nested(notice_resource_fields),
    'total': fields.Integer
}

dns_top_k_resource_fields = {
    'name': fields.String(attribute='query_text'),
    'value': fields.Integer(attribute='counter'),
}
default_top_k_fields = {
    'name': fields.String,
    'value': fields.Integer(attribute='counter'),

}

kilo_bytes_sum_by_time_resource_fields = {
    'ts': fields.String(attribute='name'),
    'value': fields.Integer(attribute='counter'),
}

kilo_bytes_sum_resource_fields = {
    'name': fields.String,
    'value': fields.Integer(attribute='counter'),
}

host_top_k_resource_fields = {
    'name': fields.String(attribute='host'),
    'value': fields.Integer(attribute='counter'),
}

port_sum_resource_fields = {
    'name': fields.String(attribute='port'),
    'value': fields.Integer(attribute='counter'),
}

protocol_sum_resource_fields = {
    'name': fields.String(attribute='prot'),
    'value': fields.Integer(attribute='counter'),
}

service_sum_resource_fields = {
    'name': fields.String(attribute="service"),
    'value': fields.Integer(attribute="counter"),
}

summary_resource_fields = {
    'ts': fields.Float,
    'value': fields.Integer(attribute='counter'),
}

status_resource_fields = {
    'name': fields.String,
    'type': fields.String,
    'host': fields.String,
    'status': fields.String,
}

config_resource_fields = {
    'pcap_path': fields.String,
    'pcap_summary': fields.String,
    'pcap_detail': fields.String,
    'sensor_path': fields.String,
    'sensor_summary': fields.String,
    'sensor_detail': fields.String,
    'network_scan_detection': fields.String,
    'dns_tunneling_detection': fields.String
    }


connections_resource_fields = {
    'connections': fields.Nested(connection_resource_fields),
    'total': fields.Integer
}

view_resource_fields = {
    'view': fields.String(attribute='view'),
    'type': fields.String(attribute="view_type"),
    'dataLabel': fields.String(attribute="data_label"),
    'viewLabel': fields.String(attribute="view_label"),
    'chartNumber': fields.String(attribute="id"),
    'cols': fields.String(attribute="cols"),
    'isFrozen': fields.String(attribute="is_frozen"),
    'isSummary': fields.String(attribute="is_summary"),
}


dashboard_resource_fields = {
    'name': fields.String,
    'views': fields.List(fields.Nested(view_resource_fields),attribute='view')
}

dashboards_name_resource_fields = {
    'name': fields.String,
}




view_parser = reqparse.RequestParser()
view_parser.add_argument('view', type=str, required=True)
view_parser.add_argument('view_type', type=str, required=True)
view_parser.add_argument('data_label', type=str, required=True)
view_parser.add_argument('view_label', type=str, required=True)
view_parser.add_argument('id', type=int)
view_parser.add_argument('cols', type=int, required=True)
view_parser.add_argument('is_frozen', type=bool, required=True)
view_parser.add_argument('is_summary', type=bool, required=True)
view_parser.add_argument('dashboard_name',type=str, required=True)

dashboard_parser = reqparse.RequestParser()
dashboard_parser.add_argument('name',type=str,required=True)

parser = reqparse.RequestParser()
parser.add_argument('filters', type=dict)
parser.add_argument('negative_filters', type=dict)
parser.add_argument('table_options',type=dict)

nested_filter_parser = reqparse.RequestParser()
nested_filter_parser.add_argument('uid', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument('resp_p', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('orig_p', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('start_time', type=int,location=('filters',))
nested_filter_parser.add_argument('end_time', type=int,location=('filters',))
nested_filter_parser.add_argument('target', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('source', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('proto', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('service', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('query_text', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('q_answers', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('q_type', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('q_rcode', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('duration', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('resp_ip_bytes', type=str, action='append',location=('filters',))
nested_filter_parser.add_argument('orig_ip_bytes', type=str, action='append',location=('filters',))


nested_message_filter_parser = reqparse.RequestParser()
nested_message_filter_parser.add_argument('start_time', type=int,location=('filters',))
nested_message_filter_parser.add_argument('end_time', type=int,location=('filters',))
nested_message_filter_parser.add_argument('notice_uid', type=str, action='append', location=('filters',))
nested_message_filter_parser.add_argument('notice_header', type=str, action='append',location=('filters',))
nested_message_filter_parser.add_argument('notice_source', type=str, action='append',location=('filters',))
nested_message_filter_parser.add_argument('notice_target', type=str, action='append',location=('filters',))


nested_negative_filter_parser = reqparse.RequestParser()
nested_negative_filter_parser.add_argument('uid', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument('resp_p', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('orig_p', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('target', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('source', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('proto', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('service', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('query_text', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('q_answers', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('q_type', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('q_rcode', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('duration', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('resp_ip_bytes', type=str, action='append',location=('negative_filters',))
nested_negative_filter_parser.add_argument('orig_ip_bytes', type=str, action='append',location=('negative_filters',))

nested_negative_message_filter_parser = reqparse.RequestParser()
nested_negative_message_filter_parser.add_argument('notice_uid', type=str, action='append', location=('negative_filters',))
nested_negative_message_filter_parser.add_argument('notice_header', type=str, action='append',location=('negative_filters',))
nested_negative_message_filter_parser.add_argument('notice_source', type=str, action='append',location=('negative_filters',))
nested_negative_message_filter_parser.add_argument('notice_target', type=str, action='append',location=('negative_filters',))

nested_table_filter_parser = reqparse.RequestParser()
nested_table_filter_parser.add_argument('itemsPerPage', type=int,location=('table_options',))
nested_table_filter_parser.add_argument('page', type=int,location=('table_options',))
nested_table_filter_parser.add_argument('sortBy', type=str,action='append',location=('table_options',))
nested_table_filter_parser.add_argument('sortDesc', type=bool,location=('table_options',))




def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class PCAPFileUpload(Resource):
    def post(self):
        if 'file' not in request.files:
           #Error no File
            abort(404, message='File not in attachment')
        file = request.files['file']
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
           #No File Selected
            return 
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file.save(os.path.join(current_app.config["UPLOAD_FOLDER"], filename))
            return success_message()

api.add_resource(PCAPFileUpload, '/pcap-upload')

 
class DNSEntries(Resource):
    @marshal_with(dns_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if start_time and end_time:
            return DNSModel.query.outerjoin(ConnectionModel).filter(ConnectionModel.ts >= start_time,
                                                               ConnectionModel.ts <= end_time).all()
        else:
            return DNSModel.query.all()
    @marshal_with(dns_resources_fields)
    def post(self): 
        args = parser.parse_args()
        data = create_table_response(args,DNSModel)
        return data

api.add_resource(DNSEntries, '/dns-entries')


class DNSEntry(Resource):
    @marshal_with(dns_resource_fields)
    def get(self, dns_uid):
        result = DNSModel.query.filter_by(uid=dns_uid).first()
        if not result:
            abort(404, message='Could not find dns entry with that uid')
        return result

api.add_resource(DNSEntry, '/dns-entry/<string:dns_uid>')

class Connections(Resource):
    @marshal_with(connection_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if start_time and end_time:
            return ConnectionModel.query.filter(ConnectionModel.ts >= start_time, ConnectionModel.ts <= end_time).all()
        else:
            return ConnectionModel.query.all()

    @marshal_with(connections_resource_fields)
    def post(self):
        args = parser.parse_args()
        data = create_table_response(args,ConnectionModel)
        return data
api.add_resource(Connections, '/connections')

class Connection(Resource):
    @marshal_with(connection_resource_fields)
    def get(self, connection_uid):
        result = ConnectionModel.query.filter_by(uid=connection_uid).first()
        if not result:
            abort(404, message='Could not find connection with that uid')
        return result

api.add_resource(Connection, '/connection/<string:connection_uid>')


class Notices(Resource):
    @marshal_with(notice_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            return NoticeModel.query.filter(NoticeModel.ts >= start_time, NoticeModel.ts <= end_time).all()
        else:
            return NoticeModel.query.all()
    @marshal_with(notices_resource_fields)
    def post(self):
        args = parser.parse_args()
        data = create_table_response(args,NoticeModel)
        return data

api.add_resource(Notices, '/notices')

class Notice(Resource):
    @marshal_with(notice_resource_fields)
    def get(self, notice_ts):
        result = NoticeModel.query().filter_by(NoticeModel.ts).first()
        if not result:
            abort(404, message='Could not find notice with that ts')
        return result


api.add_resource(Notice, '/notice/<float:notice_ts>')


class DNSTopK(Resource):
    @marshal_with(default_top_k_fields)
    def get(self):
        query = create_top_k_summary_query([],request.args,DNSTopKModel)
        return query.limit(10).all()
            
    @marshal_with(default_top_k_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(DNSModel,args,DNSModel.query_text) 
        return query.limit(10).all()


api.add_resource(DNSTopK, '/dns-top-k')


class OriginHostTopK(Resource):
    @marshal_with(default_top_k_fields)
    def get(self):
        query = create_top_k_summary_query([],request.args,OriginHostTopKModel)
        return query.limit(10).all()

    @marshal_with(default_top_k_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(ConnectionModel,args,ConnectionModel.source) 
        return query.limit(10).all()

api.add_resource(OriginHostTopK, '/origin-host-top-k')


class ResponderHostTopK(Resource):
    @marshal_with(default_top_k_fields)
    def get(self):
        query = create_top_k_summary_query([],request.args,ResponderHostTopKModel)
        return query.limit(10).all()
    @marshal_with(default_top_k_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(ConnectionModel,args,ConnectionModel.target) 
        return query.limit(10).all()


api.add_resource(ResponderHostTopK, '/responder-host-top-k')


class ResponderPortTopK(Resource):
    @marshal_with(default_top_k_fields)
    def get(self):
            query=create_top_k_port_summary_query([],request.args,ResponderPortTopKModel)
            return query.limit(10).all()

    @marshal_with(default_top_k_fields)
    def post(self):
        args = parser.parse_args()
        filters = nested_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)
        query=create_top_k_port_detail_query(filters,negative_filters)
        return query.limit(10).all()

api.add_resource(ResponderPortTopK, '/responder-port-top-k')


class PortsOfInterest(Resource):
    @marshal_with(default_top_k_fields)
    def get(self):
            query=create_top_k_port_summary_query([],request.args,PortsOfInterestModel)
            return query.limit(10).all()

    @marshal_with(default_top_k_fields)
    def post(self):
        args = parser.parse_args()
        filters = nested_filter_parser.parse_args(req=args)
        filters = add_ports_of_interest_to_filter(filters)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)
        query=create_top_k_port_detail_query(filters,negative_filters)
        return query.limit(10).all()

api.add_resource(PortsOfInterest, '/ports-of-interest')


class ProtocolSum(Resource):
    @marshal_with(default_top_k_fields)
    def get(self):
        query = create_top_k_summary_query([],request.args,ProtocolSumModel)
        return query.limit(10).all()

    @marshal_with(default_top_k_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(ConnectionModel,args,ConnectionModel.proto) 
        return query.all()

api.add_resource(ProtocolSum, '/protocol-sum')


class ServiceSum(Resource):
    @marshal_with(default_top_k_fields)
    def get(self):
        query = create_top_k_summary_query([],request.args,ServiceSumModel)
        return query.limit(10).all()
    @marshal_with(default_top_k_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(ConnectionModel,args,ConnectionModel.service) 
        return query.all()

api.add_resource(ServiceSum, '/service-sum')

## Time Filter not working :/
class IPByteSum(Resource):
    @marshal_with(default_top_k_fields)
    def get(self):
        query = create_top_k_summary_query([],request.args,IPByteSumModel)
        return query.limit(10).all()
    @marshal_with(default_top_k_fields)
    def post(self):
        args = parser.parse_args()
        filters = nested_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)
        first_query = ConnectionModel.query.session.query(literal_column("'orig'").label('name'),(func.sum(ConnectionModel.orig_ip_bytes) / 1000).label('counter'))
        second_query = ConnectionModel.query.session.query(literal_column("'resp'").label('name'),(func.sum(ConnectionModel.resp_ip_bytes)/1000).label('counter'))
        first_query = join_models_if_necessary(first_query, ConnectionModel, filters, negative_filters)
        second_query = join_models_if_necessary(second_query, ConnectionModel, filters, negative_filters)
        first_query = apply_default_filters_to_query(first_query,filters,negative_filters)
        second_query = apply_default_filters_to_query(second_query,filters,negative_filters)
        return first_query.union(second_query).group_by('name').order_by(desc('counter')).all()

api.add_resource(IPByteSum, '/ip-byte-sum')

class IpKilobyteSumByTime(Resource):
    @marshal_with(summary_resource_fields)
    def get(self):
        timeunit = '%Y-%m-%dT%H'
        query = create_by_time_summary_query([],request.args,IPByteSumModel,timeunit)
        return query.all()

    @marshal_with(summary_resource_fields)
    def post(self):
        args = parser.parse_args()
        timeunit = '%Y-%m-%dT%H'
        session = ConnectionModel.query.session.query(ConnectionModel.ts.label('ts'), func.sum(
            ConnectionModel.orig_ip_bytes / 1000 + ConnectionModel.resp_ip_bytes / 1000).label('counter'))
        query = create_by_time_detail_query(ConnectionModel,session,args,ConnectionModel.ts,timeunit)
        return query.all()        


api.add_resource(IpKilobyteSumByTime, '/ip-byte-sum/by-time')


class ConnectionSummary(Resource):
    @marshal_with(summary_resource_fields)
    def get(self):
        timeunit = '%Y-%m-%dT%H'
        query = create_by_time_summary_query([],request.args,ConnectionSumModel,timeunit)
        return query.all()

    @marshal_with(summary_resource_fields)
    def post(self):
        args = parser.parse_args()
        timeunit = '%Y-%m-%dT%H'
        session = ConnectionModel.query.session.query(ConnectionModel.ts, func.count().label('counter'))
        query = create_by_time_detail_query(ConnectionModel,session,args,ConnectionModel.ts,timeunit)

        return query.all()


api.add_resource(ConnectionSummary, '/connection-summary')


class ZeekStatus(Resource):
    @marshal_with(status_resource_fields)
    def get(self):
        try:
            result = subprocess.run(['/usr/local/zeek/bin/zeekctl','status'],stdout=subprocess.PIPE)
        except FileNotFoundError:
            abort(500, message=StatusEntry.error_message)
        output = result.stdout.decode('utf-8')
        lines = re.split(r'\n+',output)
        result = []
        for line in lines[1:len(lines)-1]:
            line = re.split(r'\s+',line)
            result.append(StatusEntry(line[0],line[1],line[2],line[3]))
        return result

api.add_resource(ZeekStatus, '/zeek-status')

"""
class Configuration(Resource):
    @marshal_with(config_resource_fields)
    def get(self):
        base_path = os.path.dirname(__file__)
        file_path = os.path.abspath(os.path.join(base_path, "..", "config.file"))
        config_exists = os.path.exists(file_path)
        
        if config_exists:
            with open(file_path,'r') as config_file:
                rows = ( line.split('\t') for line in config_file)
                header = next(rows)
                if header[0] != "#fields" and header[1] !="key" and header[2] != "value" or len(header) > 3:
                    abort(500, message="wrong config format" )
                result = { row[0]:row[1].replace('\n','').replace('') for row in rows if len(row) == 2  }
        else:
            create_config_file()
        return result 
api.add_resource(Configuration, '/configuration')

"""
class Configuration(Resource):
    def get(self):
        pcap_path = os.environ["PYTHIA_PCAP_PATH"]
        sensor_path = os.environ["PYTHIA_SENSOR_PATH"]
        scripts = os.environ['PYTHIA_SCRIPTS']
api.add_resource(Configuration, '/configuration')


class View(Resource):
    @marshal_with(view_resource_fields)
    def post(self): # Create View
        args = view_parser.parse_args()
        view = ViewModel(view=args['view'], view_type=args['view_type'], data_label=args['data_label'],
         view_label=args['view_label'],cols=args['cols'],is_frozen=args['is_frozen'], 
         is_summary=args['is_summary'],dashboard_name=args["dashboard_name"])
        p = db.session.query(DashboardModel).get(args['dashboard_name'])
        p.view.append(view)
        db.session.commit()
        return view
    def delete(self): #Delete View
        print(request.args)
        id = request.args.get('id')
        ViewModel.query.filter(ViewModel.id==id).delete()
        db.session.commit()
        return success_message()
    
    @marshal_with(view_resource_fields)
    def put(self): #Change config of view
        args = view_parser.parse_args()
        view_to_update = ViewModel.query.get(args['id'])
        if view_to_update.view != args['view']:
            view_to_update.view = args['view']
        if view_to_update.view_type != args['view_type']:
            view_to_update.view_type = args['view_type']
        if view_to_update.data_label != args['data_label']:
            view_to_update.data_label = args['data_label']
        if view_to_update.view_label != args['view_label']:
            view_to_update.view_label = args['view_label']
        if view_to_update.cols != args['cols']:
            view_to_update.cols = args['cols']
        if view_to_update.is_summary != args['is_summary']:
            view_to_update.is_summary = args['is_summary']
        if view_to_update.is_frozen != args['is_frozen']:
            view_to_update.is_frozen = args['is_frozen']
        db.session.commit()
        return view_to_update
api.add_resource(View, '/view')


class Dashboard(Resource):
    @marshal_with(dashboard_resource_fields)
    def get(self): # Send Dashboard with viewws
        args = dashboard_parser.parse_args()
        result = DashboardModel.query.get(args['name'])
        return result
    
    @marshal_with(dashboards_name_resource_fields)
    def post(self): # Create Dashboard Delete Cascade einstellen. 
        args = dashboard_parser.parse_args()
        dashboard = DashboardModel(name=args['name'])
        db.session.add(dashboard)
        db.session.commit()
        return dashboard
    
    def delete(self): # Delete Cascade
        args = dashboard_parser.parse_args()
        dashboard = DashboardModel.query.get(args['name'])
        db.session.delete(dashboard)
        db.session.commit()
        return success_message()
api.add_resource(Dashboard, '/dashboard')

class Dashboards(Resource):
    @marshal_with(dashboards_name_resource_fields)
    def get(self):   
        result =  DashboardModel.query.all()
        if len(result) == 0:
            dashboard = DashboardModel(name='default')
            db.session.add(dashboard)
            db.session.commit()
            result.append(dashboard)  
        return result 
api.add_resource(Dashboards, '/dashboards')

def create_filter_port_conditions(queries,args):
    if args['resp_p'] != None:
        ports = args['resp_p']
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_p == port[0], ConnectionModel.proto == (port[1])))
            else:
                queries.append(ConnectionModel.resp_p == port)
    if args['orig_p'] != None:
        ports = args['orig_p']
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_p == port[0], ConnectionModel.proto == (port[1])))
            else:
                queries.append(ConnectionModel.resp_p == port)
    return queries

def create_negative_filter_port_conditions(queries,args):
   
    if args['resp_p'] != None:
        ports = args['resp_p']
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_p != port[0], ConnectionModel.proto != (port[1])))
            else:
                queries.append(ConnectionModel.resp_p != port)
    if args['orig_p'] != None:
        ports = args['orig_p']
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_p != port[0], ConnectionModel.proto != (port[1])))
            else:
                queries.append(ConnectionModel.resp_p != port)
    return queries


def create_filter_conditions(queries, filters ):
    if filters['query_text'] != None:
        queries.append(func.lower(DNSModel.query_text).in_(filters['query_text']))
    if filters['q_type'] != None:
        queries.append(DNSModel.qtype_name.in_(filters['q_type']))
    if filters['q_rcode'] != None:
        queries.append(DNSModel.rcode_name.in_(filters['q_rcode']))
    if filters['q_answers'] != None:
        for elem in filters['q_answers']:
            queries.append(DNSModel.answers.ilike("%"+elem+"%"))
    if filters['start_time'] != None:
        queries.append(ConnectionModel.ts >= filters['start_time'])
    if filters['end_time'] != None:
        queries.append(ConnectionModel.ts <= filters['end_time'])
    if filters['source'] != None:
        queries.append(ConnectionModel.source.in_(filters['source']))
    if filters['target'] != None:
        queries.append(ConnectionModel.target.in_(filters['target']))
    if filters['proto'] != None:
        queries.append(func.lower(ConnectionModel.proto).in_(filters['proto']))
    if filters['service'] != None:
        queries.append(func.lower(ConnectionModel.service).in_(filters['service']))
    if filters['uid'] != None:
        queries.append(ConnectionModel.uid.in_(filters['uid']))
    if filters['orig_ip_bytes'] != None:
        create_comparison_filter_conditions('orig_ip_bytes',filters['orig_ip_bytes'],queries)
    if filters['resp_ip_bytes'] != None:        
        create_comparison_filter_conditions('resp_ip_bytes',filters['resp_ip_bytes'],queries )
    if filters['duration'] != None:        
        create_comparison_filter_conditions('duration',filters['duration'],queries)
    return queries


def create_negative_filter_conditions(queries, filters ):
    if filters['query_text'] != None:
        queries.append(func.lower(DNSModel.query_text).notin_(filters['query_text']))
    if filters['q_type'] != None:
        queries.append(DNSModel.qtype_name.notin_(filters['q_type']))
    if filters['q_rcode'] != None:
        queries.append(DNSModel.rcode_name.notin_(filters['q_rcode']))
    if filters['q_answers'] != None:
        for elem in filters['q_answers']:
            queries.append(DNSModel.answers.notilike("%"+elem+"%"))
    if filters['source'] != None:
        queries.append(ConnectionModel.source.notin_(filters['source']))
    if filters['target'] != None:
        queries.append(ConnectionModel.target.notin_(filters['target']))
    if filters['proto'] != None:
        queries.append(func.lower(ConnectionModel.proto).notin_(filters['proto']))
    if filters['service'] != None:
        queries.append(func.lower(ConnectionModel.service).notin_(filters['service']))
    if filters['uid'] != None:
        queries.append(ConnectionModel.uid.notin_(filters['uid']))
    if filters['orig_ip_bytes'] != None:
        create_negative_comparison_filter_conditions('orig_ip_bytes',filters['orig_ip_bytes'])
    if filters['resp_ip_bytes'] != None:        
        create_negative_comparison_filter_conditions('resp_ip_bytes',filters['resp_ip_bytes'] )
    if filters['duration'] != None:        
        create_negative_comparison_filter_conditions('duration',filters['duration'] )
    return queries

def create_comparison_filter_conditions(filter_name,filter_args,queries ):
    for filter_value in filter_args:      
        if filter_value.startswith('>'):
            filter_value = filter_value.strip().split('>',1)[1]
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(getattr(ConnectionModel,filter_name) > filter_value)
        elif filter_value.startswith('<'):
            filter_value = filter_value.strip().split('<',1)[1]
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(getattr(ConnectionModel,filter_name) < filter_value)
            
        elif filter_value.startswith('='):
            filter_value = filter_value.strip().split('=',1)[1]
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(getattr(ConnectionModel,filter_name) == filter_value)
        else:
                abort(400, message=filter_name + ' filter has wrong format. It must start with < or > or =')


def create_negative_comparison_filter_conditions(filter_name,filter_args ):
    for filter_value in filter_args:       
        if filter_value.startswith('>'):
            filter_value = filter_value.split('>')
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(getattr(ConnectionModel,filter_name) < filter_value)
        elif filter_value.startswith('<'):
            filter_value = filter_value.split('<')
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(getattr(ConnectionModel,filter_name) > filter_value)
            
        elif filter_value.startswith('='):
            filter_value = filter_value.split('=')
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(getattr(ConnectionModel,filter_name) != filter_value)
        else:
                abort(400, message=filter_name + ' filter has wrong format. It must start with < or > or =')



def create_notice_filter_conditions(queries,filters, negative_filters):
    if filters['start_time'] != None:
        queries.append(NoticeModel.ts >= filters['start_time'])
    if filters['end_time'] != None:
        queries.append(NoticeModel.ts <= filters['end_time'])
    if filters['notice_target'] != None:
        queries.append(ConnectionModel.target.in_(filters['target']))
    if filters['notice_source'] != None:
        queries.append(ConnectionModel.source.in_(filters['source']))
    if filters['notice_header'] != None:
        queries.append(NoticeModel.note.in_(filters['notice_header']))
    if filters['notice_uid'] != None:
        queries.append(NoticeModel.uid.in_(filters['notice_uid']))
    if negative_filters['notice_target'] != None:
        queries.append(ConnectionModel.target.notin_(filters['target']))
    if negative_filters['notice_source'] != None:
        queries.append(ConnectionModel.source.notin_(filters['source']))
    if negative_filters['notice_header'] != None:
        queries.append(NoticeModel.note.notin_(filters['notice_header']))
    if negative_filters['notice_uid'] != None:
        queries.append(NoticeModel.uid.notin_(filters['notice_uid']))
    return queries


def get_sort_query(args,query,model):
    if 'target' in args["sortBy"][0]:
        sort_value = getattr(ConnectionModel,'target')
    elif 'source' in args["sortBy"][0]:
        sort_value = getattr(ConnectionModel,'source')
    elif 'ts' == args["sortBy"][0]:
        if model == NoticeModel:
            sort_value = getattr(NoticeModel,'ts')
        else:
            sort_value = getattr(ConnectionModel,'ts')
    else:
        sort_value = getattr(model,args["sortBy"][0])
    if args['sortDesc']:
        return query.order_by(desc(sort_value))
    return query.order_by(sort_value)



def create_table_response(args,model):
    session = model.query
    
    if model == NoticeModel:
        filters = nested_message_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_message_filter_parser.parse_args(req=args)
        session = apply_notice_filters_to_query(session,filters,negative_filters)
    else: 
        filters = nested_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)
        session = apply_default_filters_to_query(session,filters,negative_filters)

    session = join_models_if_necessary(session, model, filters, negative_filters)
    
    table_filter = nested_table_filter_parser.parse_args(req=args)
    if table_filter['sortBy'] != None:
        session = get_sort_query(table_filter,session,model)
    data = session.paginate(page=table_filter['page'],per_page=table_filter['itemsPerPage'],max_per_page=None,error_out=False).items
    total = session.paginate().total
    data = {model.get_response_name(): data}
    data['total']= total
    return data


def create_top_k_summary_query(queries,args,model):
    queries = filter_time_for_query(queries,args,model)
    return model.query.session.query(model.name,func.sum(model.counter).label('counter')).filter(*queries).group_by(model.name).order_by(desc('counter'))


def create_by_time_detail_query(model,session,args,count_attribute,timeunit):
        filters = nested_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)
        session = join_models_if_necessary(session, model, filters, negative_filters)
        session = apply_default_filters_to_query(session,filters,negative_filters)
        return session.group_by(func.strftime(timeunit, model.ts, 'unixepoch')).order_by(model.ts)


def create_by_time_summary_query(queries,args,model,timeunit):
        queries = filter_time_for_query(queries,args,model)
        session = model.query.session.query(model.ts.label('ts'), func.sum(model.counter).label('counter'))
        return session.group_by(func.strftime(timeunit, model.ts, 'unixepoch')).order_by(model.ts)


def create_top_k_detail_query(model, args, count_attribute):
    filters = nested_filter_parser.parse_args(req=args)
    negative_filters = nested_negative_filter_parser.parse_args(req=args)
    session = model.query.session.query(count_attribute.label('name'),func.count(count_attribute).label('counter'))
    session = join_models_if_necessary(session, model, filters, negative_filters)
    session = apply_default_filters_to_query(session,filters,negative_filters)
    return session.group_by('name').order_by(desc('counter'))


def create_top_k_port_summary_query(queries,args,model):
    queries = filter_time_for_query(queries,args,model)
    return model.query.session.query((expression.cast(model.resp_p, types.Unicode) + '/' + model.proto).label('name'),func.sum(model.counter).label('counter')).filter(*queries).group_by('name').order_by(desc('counter'))


def create_top_k_port_detail_query(filters, negative_filters):
    session =  ConnectionModel.query.session.query((expression.cast(ConnectionModel.resp_p, types.Unicode) + '/' + ConnectionModel.proto).label('name'),func.count("name").label('counter'))
    session = join_models_if_necessary(session, ConnectionModel, filters, negative_filters)
    queries = apply_default_filters_to_query(session,filters,negative_filters)
    queries = queries.group_by('name').order_by(desc('counter'))
    return queries


def create_top_k_detail_query(model, args, count_attribute):
    filters = nested_filter_parser.parse_args(req=args)
    negative_filters = nested_negative_filter_parser.parse_args(req=args)
    session = model.query.session.query(count_attribute.label('name'),func.count(count_attribute).label('counter'))
    session = join_models_if_necessary(session, model, filters, negative_filters)
    session = apply_default_filters_to_query(session,filters,negative_filters)
    return session.group_by('name').order_by(desc('counter'))



def apply_default_filters_to_query(session,filters,negative_filters): 
    negative_queries = create_negative_filter_conditions([],negative_filters)
    queries = create_filter_conditions(negative_queries, filters)
    negative_port_queries = create_negative_filter_port_conditions([],negative_filters)
    port_queries = create_filter_port_conditions(negative_port_queries,filters)
    queries = session.filter(*queries).filter(or_(*port_queries))
    return queries

def apply_notice_filters_to_query(session,filters,negative_filters):
    queries = create_notice_filter_conditions([],filters, negative_filters)
    queries = session.filter(*queries)
    return queries

def join_models_if_necessary(session,model,filters,negative_filters):
    if model == DNSModel or model == NoticeModel:
        return session.outerjoin(ConnectionModel)
    elif args_contain_dns_filter(filters) or args_contain_dns_filter(negative_filters):
        return session.join(DNSModel)
    else:
        return session

def filter_time_for_query(queries,args,model):
    start_time = args.get('start-time')
    end_time = args.get('end-time')
    if start_time != None:
        queries.append(model.ts >= start_time)
    if end_time != None:
        queries.append(model.ts <= end_time)
    return queries


def args_contain_dns_filter(filters):
    return filters['query_text'] != None or filters['q_answers'] != None  or filters['q_type'] != None or filters['q_rcode'] 

def add_ports_of_interest_to_filter(filters):
    if filters['resp_p'] != None:
        port_args = set(filters['resp_p'])
        filters['resp_p'] = [value for value in PORTS_OF_INTEREST if value in port_args ]
    else:
        filters['resp_p'] = PORTS_OF_INTEREST    
    return filters

def success_message():
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
