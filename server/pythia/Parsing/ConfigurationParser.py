from flask_restful import reqparse, fields

status_resource_fields = {
    'name': fields.String,
    'type': fields.String,
    'host': fields.String,
    'status': fields.String,
}

config_resource_fields = {
    'path': fields.String,
    'network_scan_detection': fields.Boolean,
    'traceroute_detection': fields.Boolean,
    'detail': fields.Boolean,
    'summary': fields.Boolean
}


mode_resource_fields = {
    'mode': fields.String,
}

database_resource_fields = {
    'first_date': fields.Float,
    'last_date': fields.Float,
    'connection_count': fields.Integer,
    'size': fields.Float
}


mode_parser = reqparse.RequestParser()
mode_parser.add_argument('mode', type=str, required=True)

zeek_parser = reqparse.RequestParser()
zeek_parser.add_argument('command', type=str, required=True)

configuration_parser = reqparse.RequestParser()
configuration_parser.add_argument('path', type=str, required=True)
configuration_parser.add_argument(
    'network_scan_detection', type=bool, required=True)
configuration_parser.add_argument(
    'traceroute_detection', type=bool, required=True)
configuration_parser.add_argument('detail', type=bool, required=True)
configuration_parser.add_argument('summary', type=bool, required=True)
