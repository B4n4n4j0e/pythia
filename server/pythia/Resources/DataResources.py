from pythia import api
from flask_restful import Resource, marshal_with, abort
from flask import request
from sqlalchemy import desc, literal_column
from sqlalchemy.sql import func
from pythia.Models.DetailModels import *
from pythia.Models.SummaryModels import *
from pythia.Parsing.DataParser import *
from pythia.HelperFunctions.DataHelper import *


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
        data = create_table_response(args, DNSModel)
        return data


api.add_resource(DNSEntries, '/api/dns-entries')


class DNSEntry(Resource):
    @marshal_with(dns_resource_fields)
    def get(self, dns_uid):
        result = DNSModel.query.filter_by(uid=dns_uid).first()
        if not result:
            abort(404, message='Could not find dns entry with that uid')
        return result


api.add_resource(DNSEntry, '/api/dns-entry/<string:dns_uid>')


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
        data = create_table_response(args, ConnectionModel)
        return data


api.add_resource(Connections, '/api/connections')


class Connection(Resource):
    @marshal_with(connection_resource_fields)
    def get(self, connection_uid):
        result = ConnectionModel.query.filter_by(uid=connection_uid).first()
        if not result:
            abort(404, message='Could not find connection with that uid')
        return result


api.add_resource(Connection, '/api/connection/<string:connection_uid>')


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
        data = create_table_response(args, NoticeModel)
        return data


api.add_resource(Notices, '/api/notices')


class Notice(Resource):
    @marshal_with(notice_resource_fields)
    def get(self, notice_ts):
        result = NoticeModel.query().filter_by(NoticeModel.ts).first()
        if not result:
            abort(404, message='Could not find notice with that ts')
        return result


api.add_resource(Notice, '/api/notice/<float:notice_ts>')


class DNSTopK(Resource):
    @marshal_with(default_top_k_resource_fields)
    def get(self):
        query = create_top_k_summary_query([], request.args, DNSTopKModel)
        return query.limit(10).all()

    @marshal_with(default_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(DNSModel, args, DNSModel.query_text)
        return query.limit(10).all()


api.add_resource(DNSTopK, '/api/dns-top-k')


class OriginHostTopK(Resource):
    @marshal_with(default_top_k_resource_fields)
    def get(self):
        query = create_top_k_summary_query(
            [], request.args, OriginHostTopKModel)
        return query.limit(10).all()

    @marshal_with(default_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(
            ConnectionModel, args, ConnectionModel.source)
        return query.limit(10).all()


api.add_resource(OriginHostTopK, '/api/origin-host-top-k')


class ResponderHostTopK(Resource):
    @marshal_with(default_top_k_resource_fields)
    def get(self):
        query = create_top_k_summary_query(
            [], request.args, ResponderHostTopKModel)
        return query.limit(10).all()

    @marshal_with(default_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(
            ConnectionModel, args, ConnectionModel.target)
        return query.limit(10).all()


api.add_resource(ResponderHostTopK, '/api/responder-host-top-k')


class ResponderPortTopK(Resource):
    @marshal_with(default_top_k_resource_fields)
    def get(self):
        query = create_top_k_port_summary_query(
            [], request.args, ResponderPortTopKModel)
        return query.limit(10).all()

    @marshal_with(default_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        filters = nested_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)
        query = create_top_k_port_detail_query(filters, negative_filters)
        return query.limit(10).all()


api.add_resource(ResponderPortTopK, '/api/responder-port-top-k')


class PortsOfInterest(Resource):
    @marshal_with(default_top_k_resource_fields)
    def get(self):
        query = create_top_k_port_summary_query(
            [], request.args, PortsOfInterestModel)
        return query.limit(10).all()

    @marshal_with(default_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        filters = nested_filter_parser.parse_args(req=args)
        filters = add_ports_of_interest_to_filter(filters)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)
        query = create_top_k_port_detail_query(filters, negative_filters)
        return query.limit(10).all()


api.add_resource(PortsOfInterest, '/api/ports-of-interest')


class ProtocolSum(Resource):
    @marshal_with(default_top_k_resource_fields)
    def get(self):
        query = create_top_k_summary_query([], request.args, ProtocolSumModel)
        return query.limit(10).all()

    @marshal_with(default_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(
            ConnectionModel, args, ConnectionModel.proto)
        return query.all()


api.add_resource(ProtocolSum, '/api/protocol-sum')


class ServiceSum(Resource):
    @marshal_with(default_top_k_resource_fields)
    def get(self):
        query = create_top_k_summary_query([], request.args, ServiceSumModel)
        return query.all()

    @marshal_with(default_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        query = create_top_k_detail_query(
            ConnectionModel, args, ConnectionModel.service)
        return query.all()


api.add_resource(ServiceSum, '/api/service-sum')

# evtl muss hier noch etwas verändert werden mit größeren Datensatz testen


class IPByteSum(Resource):
    @marshal_with(default_top_k_resource_fields)
    def get(self):
        query = create_top_k_summary_query([], request.args, IPByteSumModel)
        return query.all()

    @marshal_with(default_top_k_resource_fields)
    def post(self):
        args = parser.parse_args()
        filters = nested_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)
        first_query = ConnectionModel.query.session.query(literal_column("'orig'").label(
            'name'), (func.sum(ConnectionModel.orig_ip_bytes) / 1000).label('counter'))
        second_query = ConnectionModel.query.session.query(literal_column("'resp'").label(
            'name'), (func.sum(ConnectionModel.resp_ip_bytes)/1000).label('counter'))
        first_query = join_models_if_necessary(
            first_query, ConnectionModel, filters, negative_filters)
        second_query = join_models_if_necessary(
            second_query, ConnectionModel, filters, negative_filters)
        first_query = apply_default_filters_to_query(
            first_query, filters, negative_filters)
        second_query = apply_default_filters_to_query(
            second_query, filters, negative_filters)
        result = first_query.union(second_query).group_by(
            'name').order_by(desc('counter')).all()
        # if no value is found return empty list
        if (result[0][1] is None and result[1][1] is None) or (result[0][1] == 0 and result[1][1] == 0):
            result = []
        return result


api.add_resource(IPByteSum, '/api/ip-byte-sum')


class IpKilobyteSumByTime(Resource):
    @marshal_with(summary_by_time_resource_fields)
    def get(self):
        timeunit = '%Y-%m-%dT%H'
        # Check if model exists
        query = create_by_time_summary_query(
            [], request.args, IPByteSumModel, timeunit)
        return query.all()

    @marshal_with(summary_by_time_resource_fields)
    def post(self):
        args = parser.parse_args()
        timeunit = '%Y-%m-%dT%H'
        session = ConnectionModel.query.session.query(ConnectionModel.ts.label('ts'), func.sum(
            ConnectionModel.orig_ip_bytes / 1024 + ConnectionModel.resp_ip_bytes / 1024).label('counter'))
        query = create_by_time_detail_query(
            ConnectionModel, session, args, timeunit)
        return query.all()


api.add_resource(IpKilobyteSumByTime, '/api/ip-byte-sum/by-time')


class ConnectionSummary(Resource):
    @marshal_with(summary_by_time_resource_fields)
    def get(self):
        timeunit = '%Y-%m-%dT%H'
        query = create_by_time_summary_query(
            [], request.args, ConnectionSumModel, timeunit)
        return query.all()

    @marshal_with(summary_by_time_resource_fields)
    def post(self):
        args = parser.parse_args()
        timeunit = '%Y-%m-%dT%H'
        session = ConnectionModel.query.session.query(
            ConnectionModel.ts, func.count().label('counter'))
        query = create_by_time_detail_query(
            ConnectionModel, session, args, timeunit)
        return query.all()


api.add_resource(ConnectionSummary, '/api/connection-summary')
