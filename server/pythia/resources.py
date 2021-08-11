from pythia import api
from flask_restful import Resource, fields, marshal_with, abort
from flask import request
from pythia.models import *
import sqlite3

DB_PATH = "./pythia/pythia.sqlite"

dns_resource_fields = {
    'ts': fields.Float(attribute='connection.ts'),
    'uid': fields.String,
    'query_text': fields.String,
    'qtype_name': fields.String,
    'rcode_name': fields.String,
    'connection.origin_host': fields.String,
    'connection.resp_host': fields.String
}

connection_resource_fields = {
    'ts': fields.Float,
    'uid': fields.String,
    'origin_host': fields.String,
    'origin_port': fields.String,
    'resp_host': fields.String,
    'resp_port': fields.String,
    'proto': fields.String,
    'service': fields.String,
    'duration': fields.Float,
    'orig_ip_bytes': fields.Float,
    'resp_ip_bytes': fields.Float
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
    'query_text': fields.String,
    'counter': fields.Integer,
}

kilo_bytes_sum_resource_fields = {
    'name': fields.String,
    'counter': fields.Integer,
}

host_top_k_resource_fields = {
    'host': fields.String,
    'counter': fields.Integer,
}

port_sum_resource_fields = {
    'port': fields.Integer(attribute='p'),
    'protocol': fields.String(attribute='prot'),
    'counter': fields.Integer,
}

protocol_sum_resource_fields = {
    'protocol': fields.String(attribute='prot'),
    'counter': fields.Integer,
}

service_sum_resource_fields = {
    'service': fields.String,
    'counter': fields.Integer,
}


class DNSEntries(Resource):
    @marshal_with(dns_resource_fields)
    def get(self):
        return DnsModel.query.all()


api.add_resource(DNSEntries, '/dns-entries')


class DNSEntry(Resource):
    @marshal_with(dns_resource_fields)
    def get(self, dns_uid):
        result = DnsModel.query.filter_by(uid=dns_uid).first()
        if not result:
            abort(404, message='Could not find dns entry with that uid')
        return result


api.add_resource(DNSEntry, '/dns-entry/<string:dns_uid>')


class Connections(Resource):
    @marshal_with(connection_resource_fields)
    def get(self):
        return ConnectionModel.query.all()


api.add_resource(Connections, '/connections')


class Connection(Resource):
    @marshal_with(connection_resource_fields)
    def get(self, connection_uid):
        result = ConnectionModel.query.filter_by(uid=connection_uid).first()
        print(result)
        if not result:
            abort(404, message='Could not find connection with that uid')
        return result


api.add_resource(Connection, '/connection/<string:connection_uid>')


class Notices(Resource):
    @marshal_with(notice_resource_fields)
    def get(self):
        return NoticeModel.query.all()


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
            query = "SELECT query_text, Sum(counter) AS counter FROM dns_top_k WHERE ts >=? AND ts <= ? " \
                    "GROUP BY query_text ORDER BY counter DESC LIMIT 10"
            return get_data(query, DNSTopKEntry, (start_time, end_time))
        else:
            query = "SELECT query_text, Sum(counter) AS counter FROM dns_top_k " \
                    "GROUP BY query_text ORDER BY counter DESC LIMIT 10"
            return get_data(query, DNSTopKEntry, [])


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


api.add_resource(OriginHostTopK, '/origin-top-k')


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


api.add_resource(ResponderHostTopK, '/responder-host-top-k')


class ResponderPortTopK(Resource):
    @marshal_with(port_sum_resource_fields )
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


api.add_resource(ResponderPortTopK, '/responder-port-top-k')


class PortsOfInterest(Resource):
    @marshal_with(port_sum_resource_fields )
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


api.add_resource(IpKilobyteSum, '/ip-kilobyte-sum')


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
