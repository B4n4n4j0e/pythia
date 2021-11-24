from pythia import api, db
from flask_restful import Resource, fields, marshal_with, abort, reqparse, marshal
from flask import request
from pythia.models import *
import sqlite3
import subprocess
import re
from sqlalchemy import and_, or_, desc, func, literal_column, types, asc
from sqlalchemy.sql import func, expression
import copy

DB_PATH = "pythia/pythia.sqlite"
PORTS_OF_INTEREST = ["10/tcp", "21/tcp", "22/tcp", "23/tcp", "25/tcp", "80/tcp", "110/tcp", "139/tcp", "443/tcp",
                     "445/tcp", "3389/tcp", "10/udp", "53/udp",
                     "67/udp", "123/udp", "135/udp", "137/udp", "138/udp", "161/udp", "445/udp", "631/udp", "1434/udp"]
dns_resource_fields = {
    'ts': fields.Float(attribute='connection.ts'),
    'uid': fields.String,
    'query_text': fields.String,
  #  'answers': fields.String,
    'qtype_name': fields.String,
    'rcode_name': fields.String,
    'connection.origin_host': fields.String,
    'connection.resp_host': fields.String
}

connection_resource_fields = {
    'ts': fields.Float,
    'uid': fields.String,
    'source': fields.String(attribute='origin_host'),
    'origin_port': fields.String,
    'target': fields.String(attribute='resp_host'),
    'resp_port': fields.String,
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
    'uid': fields.String,
    'connection.origin_host': fields.String,
    'connection.resp_host': fields.String,
    'note': fields.String,
    'msg': fields.String
}

dns_top_k_resource_fields = {
    'name': fields.String(attribute='query'),
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
    'name': fields.String(attribute='p'),
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

parser = reqparse.RequestParser()
parser.add_argument('start_time', type=int)
parser.add_argument('end_time', type=int)
parser.add_argument('uid', type=str, action='append')
parser.add_argument('ports', type=str, action='append')
parser.add_argument('id_resp_h', type=str, action='append')
parser.add_argument('id_orig_h', type=str, action='append')
parser.add_argument('proto', type=str, action='append')
parser.add_argument('service', type=str, action='append')
# parser.add_argument('duration', type=int)
# parser.add_argument('orig_ip_bytes', type=str)
# parser.add_argument('resp_ip_bytes', type=str)
parser.add_argument('query_text', type=str, action='append')
parser.add_argument('target', type=str, action='append')
parser.add_argument('qtype_name', type=str, action='append')
parser.add_argument('rcode_name', type=str, action='append')
parser.add_argument('note', type=str, action='append')

table_parser = copy.deepcopy(parser)
table_parser.add_argument('itemsPerPage', type=int)
table_parser.add_argument('page', type=int)
table_parser.add_argument('sortBy', type=str,action='append')
table_parser.add_argument('sortDesc', type=bool)

 
class DNSEntries(Resource):
    @marshal_with(dns_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if start_time and end_time:
            return DNSModel.query.join(ConnectionModel).filter(ConnectionModel.ts >= start_time,
                                                               ConnectionModel.ts <= end_time).all()
        else:
            return DNSModel.query.all()
    @marshal_with(dns_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = DNSModel.query.join(ConnectionModel)
        # implement note Filter
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])  
        return session.filter(*queries).filter(or_(*port_queries)).all()

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
        args = table_parser.parse_args()
        session = ConnectionModel.query
        # implement note Filter Count Query
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])  
        queries = session.filter(*queries).filter(or_(*port_queries))

        if args['sortBy'] != None:
            queries = get_sort_query(args,queries)
        data = queries.paginate(args['page'],args['itemsPerPage'],False).items
        total = queries.paginate().total
        data = {'connections': data}
        data['total']= total
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
            return NoticeModel.query.join(ConnectionModel).filter(ConnectionModel.ts >= start_time, ConnectionModel.ts <= end_time).all()
        else:
            return NoticeModel.query.all()
    
    @marshal_with(notice_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = NoticeModel.query.join(ConnectionModel)
        # implement note Filter
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])  
        return session.filter(*queries).filter(or_(*port_queries)).all()


api.add_resource(Notices, '/notices')


class Notice(Resource):
    @marshal_with(notice_resource_fields)
    def get(self, notice_ts):
        result = NoticeModel.query().filter_by(ts=notice_ts).first()
        if not result:
            abort(404, message='Could not find notice with that ts')
        return result


api.add_resource(Notice, '/notice/<float:notice_ts>')


class DNSTopK(Resource):
    @marshal_with(dns_top_k_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')

        if (start_time and end_time):
            query = "SELECT query, Sum(counter) AS counter FROM dns_top_k WHERE ts >=? AND ts <= ? " \
                    "GROUP BY query ORDER BY counter DESC LIMIT 10"
            return get_data(query, DNSTopKEntry, (start_time, end_time))
        else:
            query = "SELECT query, Sum(counter) AS counter FROM dns_top_k " \
                    "GROUP BY query ORDER BY counter DESC LIMIT 10"
            return get_data(query, DNSTopKEntry, [])

    @marshal_with(dns_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = ConnectionModel.query.session.query(DNSModel.query_text.label('query'),
                                                      func.count(DNSModel.query_text).label('counter')).join(
            ConnectionModel)
        # implement note Filter
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])        
        return session.filter(*queries).filter(or_(*port_queries)).group_by(DNSModel.query_text).order_by(desc('counter')).limit(10).all()


api.add_resource(DNSTopK, '/dns-top-k')


class OriginHostTopK(Resource):
    @marshal_with(host_top_k_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            query = "SELECT host, Sum(counter) AS counter FROM origin_host_top_k WHERE ts >=? AND " \
                    "ts <= ? GROUP BY host ORDER BY counter DESC LIMIT 10"
            return get_data(query, OriginHostTopKEntry, (start_time, end_time))
        else:
            query = "SELECT host, Sum(counter) AS counter FROM origin_host_top_k  GROUP BY host " \
                    "ORDER BY counter DESC LIMIT 10"
            return get_data(query, OriginHostTopKEntry, [])

    @marshal_with(host_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = ConnectionModel.query.session.query(ConnectionModel.origin_host.label('host'),
                                                      func.count(ConnectionModel.origin_host).label('counter'))
        session = join_models(session, args)
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])
        return session.filter(*queries).group_by(ConnectionModel.origin_host).filter(or_(*port_queries)).order_by(desc('counter')).limit(10).all()


api.add_resource(OriginHostTopK, '/origin-host-top-k')


class ResponderHostTopK(Resource):
    @marshal_with(host_top_k_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            query = "SELECT host, Sum(counter) AS counter FROM resp_host_top_k WHERE ts >=? AND " \
                    "ts <= ? GROUP BY host ORDER BY counter DESC LIMIT 10"
            return get_data(query, ResponderHostTopKEntry, (start_time, end_time))
        else:
            query = "SELECT host, Sum(counter) AS counter FROM resp_host_top_k  GROUP BY host " \
                    "ORDER BY counter DESC LIMIT 10"
            return get_data(query, ResponderHostTopKEntry, [])

    @marshal_with(host_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = ConnectionModel.query.session.query(ConnectionModel.resp_host.label('host'),
                                                      func.count(ConnectionModel.resp_host).label('counter'))
        session = join_models(session, args)
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])        
        return session.filter(*queries).filter(*queries).filter(or_(*port_queries)).group_by(ConnectionModel.resp_host).order_by(
            desc('counter')).limit(10).all()


api.add_resource(ResponderHostTopK, '/responder-host-top-k')


class ResponderPortTopK(Resource):
    @marshal_with(port_sum_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            query = "SELECT p, prot, Sum(counter) AS counter FROM resp_port_top_k WHERE ts >=? AND " \
                    "ts <= ? GROUP BY prot, p ORDER BY counter DESC LIMIT 10"
            return get_data(query, ResponderPortTopKEntry, (start_time, end_time))
        else:
            query = "SELECT p,prot, Sum(counter) AS counter FROM resp_port_top_k " \
                    "GROUP BY prot, p ORDER BY counter DESC LIMIT 10"
            return get_data(query, ResponderPortTopKEntry, [])

    @marshal_with(port_sum_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = ConnectionModel.query.session.query(
            (expression.cast(ConnectionModel.resp_port, types.Unicode) + '/' + ConnectionModel.proto).label('p'),
            func.count(literal_column('"p"')).label('counter'))
        session = join_models(session, args)
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])        
        return session.filter(*queries).filter(or_(*port_queries)).group_by(literal_column('"p"')).order_by(desc('counter')).limit(10).all()


api.add_resource(ResponderPortTopK, '/responder-port-top-k')


class PortsOfInterest(Resource):
    @marshal_with(port_sum_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            query = "SELECT p, prot, Sum(counter) AS counter FROM resp_poi_sum WHERE ts >=? AND " \
                    "ts <= ? GROUP BY prot, p ORDER BY counter DESC"
            return get_data(query, PortsOfInterestEntry, (start_time, end_time))
        else:
            query = "SELECT p,prot, Sum(counter) AS counter FROM resp_poi_sum " \
                    "GROUP BY prot, p ORDER BY counter DESC"
            return get_data(query, PortsOfInterestEntry, [])

    @marshal_with(port_sum_resource_fields)
    def post(self):
        args = parser.parse_args()
        if args['ports'] != None:
            port_args = set(args['ports'])
            args['ports'] = [value for value in PORTS_OF_INTEREST if value in port_args ]
        else:
            args['ports'] = PORTS_OF_INTEREST
        session = ConnectionModel.query.session.query((expression.cast(ConnectionModel.resp_port, types.Unicode) + '/' + ConnectionModel.proto).label('p'),func.count(literal_column('"p"')).label('counter'))
        session = join_models(session, args)
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])
        return session.filter(*queries).filter(or_(*port_queries)).group_by(literal_column('"p"')).order_by(desc('counter')).all()

api.add_resource(PortsOfInterest, '/ports-of-interest')


class ProtocolSum(Resource):
    @marshal_with(protocol_sum_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            query = "SELECT prot, Sum(counter) AS counter FROM prot_sum WHERE ts >=? AND " \
                    "ts <= ? GROUP BY prot ORDER BY counter DESC"
            return get_data(query, ProtocolSumEntry, (start_time, end_time))
        else:
            query = "SELECT prot, Sum(counter) AS counter FROM prot_sum " \
                    "GROUP BY prot ORDER BY counter DESC "
            return get_data(query, ProtocolSumEntry, [])

    @marshal_with(protocol_sum_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = ConnectionModel.query.session.query(ConnectionModel.proto.label('prot'),
                                                      func.count(ConnectionModel.proto).label('counter'))
        session = join_models(session, args)
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])        
        return session.filter(*queries).filter(or_(*port_queries)).group_by(ConnectionModel.proto).order_by(desc('counter')).all()


api.add_resource(ProtocolSum, '/protocol-sum')


class ServiceSum(Resource):
    @marshal_with(service_sum_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            query = "SELECT service, Sum(counter) AS counter FROM service_sum WHERE ts >=? AND " \
                    "ts <= ? GROUP BY service ORDER BY counter DESC"
            return get_data(query, ServiceSumEntry, (start_time, end_time))
        else:
            query = "SELECT service, Sum(counter) AS counter FROM service_sum " \
                    "GROUP BY service ORDER BY counter DESC "
            return get_data(query, ServiceSumEntry, [])

    @marshal_with(service_sum_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = ConnectionModel.query.session.query(ConnectionModel.service,
                                                      func.count(ConnectionModel.service).label('counter'))
        session = join_models(session, args)
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])        
        return session.filter(*queries).filter(or_(*port_queries)).group_by(ConnectionModel.service).order_by(desc('counter')).all()
api.add_resource(ServiceSum, '/service-sum')


class IpKilobyteSum(Resource):
    @marshal_with(kilo_bytes_sum_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            query = "SELECT name, Sum(counter) AS counter FROM ip_bytes_sum WHERE ts >=? AND " \
                    "ts <= ? GROUP BY name ORDER BY name"
            return get_data(query, IPKilobyteSumEntry, (start_time, end_time))
        else:
            query = "SELECT name, Sum(counter) AS counter FROM ip_bytes_sum GROUP BY name ORDER BY name"
            return get_data(query, IPKilobyteSumEntry, [])

    @marshal_with(kilo_bytes_sum_resource_fields)
    def post(self):
        args = parser.parse_args()
        session_origin = ConnectionModel.query.session.query(literal_column('"orig"').label('name'),
                                                             func.sum(ConnectionModel.orig_ip_bytes).label('counter'))
        session_origin = join_models(session_origin, args)
        session_resp = ConnectionModel.query.session.query(literal_column('"resp"').label('name'),
                                                           func.sum(ConnectionModel.resp_ip_bytes).label('counter'))
        session_resp = join_models(session_resp, args)
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])
        return session_origin.filter(*queries).filter(or_(*port_queries)).union(session_resp.filter(*queries).filter(or_(*port_queries))).all()

api.add_resource(IpKilobyteSum, '/ip-kilobyte-sum')


class IpKilobyteSumByTime(Resource):
    @marshal_with(kilo_bytes_sum_by_time_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if (start_time and end_time):
            query = "SELECT ts,SUM(counter) as counter FROM ip_bytes_sum WHERE ts >=? AND " \
                    "ts <= ? GROUP BY strftime('%Y-%m-%dT%H',ts,'unixepoch')"
            return get_data(query, IPKilobyteSumEntry, (start_time, end_time))
        else:
            query = "SELECT ts,SUM(counter) FROM ip_bytes_sum GROUP BY strftime('%Y-%m-%dT%H',ts,'unixepoch')"
            return get_data(query, IPKilobyteSumEntry, [])

    @marshal_with(kilo_bytes_sum_by_time_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = ConnectionModel.query.session.query(ConnectionModel.ts.label('name'), func.sum(
            ConnectionModel.orig_ip_bytes / 1000 + ConnectionModel.resp_ip_bytes / 1000).label('counter'))
        session = join_models(session, args)
        queries = create_filter_query([], args)
        # @todo implement filter origin host dest host
        port_queries = create_filter_port_query([],args['ports'])
        return session.filter(*queries).filter(or_(*port_queries)).group_by(func.strftime('%Y-%m-%dT%H', ConnectionModel.ts, 'unixepoch')).all()


api.add_resource(IpKilobyteSumByTime, '/ip-kilobyte-sum/by-time')


class ConnectionSummary(Resource):
    @marshal_with(summary_resource_fields)
    def get(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')

        if (start_time and end_time):
            query = "SELECT ts,COUNT(*) as counter FROM conn WHERE ts >=? AND " \
                    "ts <= ? GROUP BY strftime('%Y-%m-%dT%H',ts,'unixepoch')"
            return get_data(query, ConnectionHourEntry, (start_time, end_time))
        else:
            query = "SELECT ts,COUNT(*) as counter FROM conn GROUP BY strftime('%Y-%m-%dT%H',ts,'unixepoch')"
            return get_data(query, ConnectionHourEntry, [])

    @marshal_with(summary_resource_fields)
    def post(self):
        args = parser.parse_args()
        session = ConnectionModel.query.session.query(ConnectionModel.ts, func.count().label('counter'))
        session = join_models(session, args)
        queries = create_filter_query([], args)
        port_queries = create_filter_port_query([],args['ports'])
        return session.filter(*queries).filter(or_(*port_queries)).group_by(func.strftime('%Y-%m-%dT%H', ConnectionModel.ts, 'unixepoch')).all()


api.add_resource(ConnectionSummary, '/connection-summary')


class ZeekStatus(Resource):
    @marshal_with(status_resource_fields)
    def get(self):
        '''
        try:
            result = subprocess.run(['/usr/local/zeek/bin/zeekctl','status'],stdout=subprocess.PIPE)
        except FileNotFoundError:
            abort(500, message=StatusEntry.error_message)
        output = result.stdout.decode('utf-8')
        lines = re.split(r'\n+',output)
        result = []
        for line in lines[1:len(lines-1)]:
            line = re.split(r'\s+',line)
            result.append(StatusEntry(line[0],line[1],line[2],line[3]))
        return result
'''
        entry1 = StatusEntry('manager', 'manager', 'localhost', 'running')
        entry2 = StatusEntry('proxy', 'proxy', 'localhost', 'running')
        entry3 = StatusEntry('worker-1', 'worker', 'localhost', 'running')
        return [entry1, entry2, entry3]


api.add_resource(ZeekStatus, '/zeek-status')


def get_data(query, cl, parameter):
    try:
        conn = sqlite3.connect(DB_PATH)
    except ConnectionError as e:
        print(e)
    cur = conn.cursor()
    rows = cur.execute(query, parameter)
    result = []
    for row in rows:
        result.append(cl(*row))
    if not result:
        abort(404, message=cl.error_message)

    return result

def create_filter_port_query(queries,ports):
    if ports != None:
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_port == port[0], ConnectionModel.proto == (port[1])))
            else:
                queries.append(ConnectionModel.resp_port == port)
    return queries
def create_filter_query(queries, filters):
    if filters['query_text'] != None:
        queries.append(func.lower(DNSModel.query_text).in_(filters['query_text']))
    if filters['start_time'] != None:
        queries.append(ConnectionModel.ts >= filters['start_time'])
    if filters['end_time'] != None:
        queries.append(ConnectionModel.ts <= filters['end_time'])
    if filters['id_orig_h'] != None:
        queries.append(ConnectionModel.origin_host.in_(filters['id_orig_h']))
    if filters['id_resp_h'] != None:
        queries.append(ConnectionModel.resp_host.in_(filters['id_resp_h']))
    if filters['proto'] != None:
        queries.append(func.lower(ConnectionModel.proto).in_(filters['proto']))
    if filters['service'] != None:
        queries.append(func.lower(ConnectionModel.service).in_(filters['service']))
    return queries


def join_models(session, filters):
    if filters['query_text'] != None:
        session = session.join(DNSModel)
        # @todo implement message filter
    #  if filters['msg']!= None :
    #      session =  session.join(NoticeModel)
    return session


def get_sort_query(args, query):
    if args['sortBy'][0] == 'source':
        sort_value = 'id.orig_h'
    elif args['sortBy'][0] == 'origin_port':
        sort_value = 'id.orig_p'
    elif args['sortBy'][0] == 'target':
        sort_value = 'id.resp_h'
    elif args['sortBy'][0] == 'resp_port':
        sort_value = 'id.resp_p'
    else:
        sort_value = args['sortBy'][0]

    if args['sortDesc']:
        return query.order_by(desc(sort_value))

    return query.order_by(asc(sort_value))
