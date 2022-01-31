from flask_restful import reqparse, fields

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

notices_resource_fields = {
    'notices': fields.Nested(notice_resource_fields),
    'total': fields.Integer
}

default_top_k_resource_fields = {
    'name': fields.String(default="-"),
    'value': fields.Integer(attribute='counter'),

}

summary_by_time_resource_fields = {
    'ts': fields.Float,
    'value': fields.Integer(attribute='counter'),
}

parser = reqparse.RequestParser()
parser.add_argument('filters', type=dict)
parser.add_argument('negative_filters', type=dict)
parser.add_argument('table_options', type=dict, required=False)

nested_filter_parser = reqparse.RequestParser()
nested_filter_parser.add_argument(
    'uid', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'resp_p', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'orig_p', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'start_time', type=int, location=('filters',))
nested_filter_parser.add_argument('end_time', type=int, location=('filters',))
nested_filter_parser.add_argument(
    'target', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'source', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'proto', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'service', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'query_text', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'q_answers', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'q_type', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'q_rcode', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'duration', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'resp_ip_bytes', type=str, action='append', location=('filters',))
nested_filter_parser.add_argument(
    'orig_ip_bytes', type=str, action='append', location=('filters',))


nested_message_filter_parser = reqparse.RequestParser()
nested_message_filter_parser.add_argument(
    'start_time', type=int, location=('filters',))
nested_message_filter_parser.add_argument(
    'end_time', type=int, location=('filters',))
nested_message_filter_parser.add_argument(
    'notice_uid', type=str, action='append', location=('filters',))
nested_message_filter_parser.add_argument(
    'notice_header', type=str, action='append', location=('filters',))
nested_message_filter_parser.add_argument(
    'notice_source', type=str, action='append', location=('filters',))
nested_message_filter_parser.add_argument(
    'notice_target', type=str, action='append', location=('filters',))


nested_negative_filter_parser = reqparse.RequestParser()
nested_negative_filter_parser.add_argument(
    'uid', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'resp_p', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'orig_p', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'target', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'source', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'proto', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'service', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'query_text', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'q_answers', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'q_type', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'q_rcode', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'duration', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'resp_ip_bytes', type=str, action='append', location=('negative_filters',))
nested_negative_filter_parser.add_argument(
    'orig_ip_bytes', type=str, action='append', location=('negative_filters',))

nested_negative_message_filter_parser = reqparse.RequestParser()
nested_negative_message_filter_parser.add_argument(
    'notice_uid', type=str, action='append', location=('negative_filters',))
nested_negative_message_filter_parser.add_argument(
    'notice_header', type=str, action='append', location=('negative_filters',))
nested_negative_message_filter_parser.add_argument(
    'notice_source', type=str, action='append', location=('negative_filters',))
nested_negative_message_filter_parser.add_argument(
    'notice_target', type=str, action='append', location=('negative_filters',))

nested_table_filter_parser = reqparse.RequestParser()
nested_table_filter_parser.add_argument(
    'itemsPerPage', type=int, location=('table_options',))
nested_table_filter_parser.add_argument(
    'page', type=int, location=('table_options',))
nested_table_filter_parser.add_argument(
    'sortBy', type=str, action='append', location=('table_options',))
nested_table_filter_parser.add_argument(
    'sortDesc', type=bool, location=('table_options',))
