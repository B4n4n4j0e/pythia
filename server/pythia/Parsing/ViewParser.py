from flask_restful import reqparse, fields

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
    'views': fields.List(fields.Nested(view_resource_fields), attribute='view')
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
view_parser.add_argument('dashboard_name', type=str, required=True)

dashboard_parser = reqparse.RequestParser()
dashboard_parser.add_argument('name', type=str, required=True)
