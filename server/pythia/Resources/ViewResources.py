
from pythia import ViewModel, DashboardModel
from flask_restful import Resource, marshal_with
from flask import request
from pythia.Parsing.ViewParser import *
from pythia.Resources.DataResources import api,db
from pythia.HelperFunctions.MessageHelper import success_message


class View(Resource):
    @marshal_with(view_resource_fields)
    def post(self):  # Create View
        args = view_parser.parse_args()
        view = ViewModel(view=args['view'], view_type=args['view_type'], data_label=args['data_label'],
                         view_label=args['view_label'], cols=args['cols'], is_frozen=args['is_frozen'],
                         is_summary=args['is_summary'], dashboard_name=args["dashboard_name"])
        p = db.session.query(DashboardModel).get(args['dashboard_name'])
        print(args)
        p.view.append(view)
        db.session.commit()
        return view

    def delete(self):  # Delete View
        id = request.args.get('id')
        ViewModel.query.filter(ViewModel.id == id).delete()
        db.session.commit()
        return success_message()

    @marshal_with(view_resource_fields)
    def put(self):  # Change config of view
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


api.add_resource(View, '/api/view')


class Dashboard(Resource):
    @marshal_with(dashboard_resource_fields)
    def get(self):  # Send Dashboard with viewws
        args = dashboard_parser.parse_args()
        result = DashboardModel.query.get(args['name'])
        return result

    @marshal_with(dashboards_name_resource_fields)
    def post(self):  # Create Dashboard Delete Cascade einstellen.
        args = dashboard_parser.parse_args()
        dashboard = DashboardModel(name=args['name'])
        db.session.add(dashboard)
        db.session.commit()
        return dashboard

    def delete(self):  # Delete Cascade
        args = dashboard_parser.parse_args()
        dashboard = DashboardModel.query.get(args['name'])
        db.session.delete(dashboard)
        db.session.commit()
        return success_message()


api.add_resource(Dashboard, '/api/dashboard')


class Dashboards(Resource):
    @marshal_with(dashboards_name_resource_fields)
    def get(self):
        result = DashboardModel.query.all()
        if len(result) == 0:
            dashboard = DashboardModel(name='default')
            db.session.add(dashboard)
            db.session.commit()
            result.append(dashboard)
        return result


api.add_resource(Dashboards, '/api/dashboards')
