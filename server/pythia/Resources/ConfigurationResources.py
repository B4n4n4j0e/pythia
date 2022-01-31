from flask_restful import Resource, marshal_with, abort
from flask import request, current_app
from sqlalchemy import desc, func
from werkzeug.utils import secure_filename
from os import path
from pythia.Resources.DataResources import api, db, ConnectionModel, DNSModel, NoticeModel, DNSTopKModel, OriginHostTopKModel, ResponderHostTopKModel, ResponderPortTopKModel, PortsOfInterestModel, ProtocolSumModel, ServiceSumModel, IPByteSumModel, ConnectionSumModel
from pythia.Parsing.ConfigurationParser import *
from pythia.HelperFunctions.ConigurationHelper import *
from pythia.HelperFunctions.MessageHelper import success_message

ALLOWED_EXTENSIONS = {'pcap'}


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


class PCAPFileUpload(Resource):
    def post(self):
        if 'file' not in request.files:
            abort(400, message='File not in attachment')
        file = request.files['file']
        if file.filename == '':
            return abort(400, message='Invalid filename')
        if file and allowed_file(file.filename):
            create_db_if_not_exist('PCAP')
            filename = secure_filename(file.filename)
            file_location = path.join(
                current_app.config["UPLOAD_FOLDER"], filename)
            file.save(file_location)
            process_zeek(file_location)
            return success_message()
        else:
            return abort(400, message='Invalid filetype')


api.add_resource(PCAPFileUpload, '/api/pcap-upload')


class Configuration(Resource):
    @marshal_with(config_resource_fields)
    def get(self):
        response = get_config_from_env()
        return response

    @marshal_with(config_resource_fields)
    def post(self):
        args = configuration_parser.parse_args()
        config_changes = create_config_change_list(args)
        save_config(config_changes)
        result = get_config_from_env()
        return result


api.add_resource(Configuration, '/api/configuration')


class ZeekStatus(Resource):
    @marshal_with(status_resource_fields)
    def get(self):
        result = get_zeek_status()
        return result

    def post(self):
        args = zeek_parser.parse_args()
        command = args['command']
        if command == 'deploy':
            status = get_zeek_status()
            for entry in status:
                if entry.status == "running":
                    abort(409, message='Zeek is already running')
            deploy_zeek()
            return success_message()
        elif command == 'stop':
            stop_zeek()
            return success_message()
        else:
            abort(400, message='Unknown command - known commands: deploy, stop')


api.add_resource(ZeekStatus, '/api/zeek')


class DetailData(Resource):
    @marshal_with(database_resource_fields)
    def get(self):
        result = ConnectionModel.query.order_by(ConnectionModel.ts).first()
        if result is not None:
            first_date = result.ts
        else:
            first_date = -1
        result = ConnectionModel.query.order_by(
            desc(ConnectionModel.ts)).first()
        if result is not None:
            last_date = result.ts
        else:
            last_date = -1
        connection_count = ConnectionModel.query.count()
        path = get_detail_db_path_by_mode(active_mode)
        size = get_db_size(path)
        size_in_mb = round(size / (1024*1024), 2)
        data = {'first_date': first_date, 'last_date': last_date,
                'connection_count': connection_count, 'size': size_in_mb}
        return data

    def delete(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if start_time and end_time:
            ConnectionModel.query.filter(
                ConnectionModel.ts >= start_time, ConnectionModel.ts <= end_time).delete()
            DNSModel.query.delete()
            NoticeModel.query.filter(
                NoticeModel.ts >= start_time, NoticeModel.ts <= end_time).delete()
            db.session.commit()
        else:
            ConnectionModel.query.delete()
            DNSModel.query.delete()
            NoticeModel.query.delete()
            db.session.commit()

        return success_message()


api.add_resource(DetailData, '/api/detail-data')


class SummaryData(Resource):
    @marshal_with(database_resource_fields)
    def get(self):
        result = ConnectionSumModel.query.order_by(
            ConnectionSumModel.ts).first()
        if result is not None:
            first_date = result.ts
        else:
            first_date = -1
        result = ConnectionSumModel.query.order_by(
            desc(ConnectionSumModel.ts)).first()
        if result is not None:
            last_date = result.ts
        else:
            last_date = -1

        connection_count = ConnectionSumModel.query.session.query(
            (func.sum(ConnectionSumModel.counter).label('counter'))).first().counter
        if connection_count is None:
            connection_count = 0

        path = get_summary_db_path_by_mode(active_mode)
        size = get_db_size(path)
        size_in_mb = round(size / (1024*1024), 2)

        data = {'first_date': first_date, 'last_date': last_date,
                'connection_count': connection_count, 'size': size_in_mb}
        return data

    def delete(self):
        start_time = request.args.get('start-time')
        end_time = request.args.get('end-time')
        if start_time and end_time:
            DNSTopKModel.query.filter(
                DNSTopKModel.ts >= start_time, DNSTopKModel.ts <= end_time).delete()
            OriginHostTopKModel.query.filter(
                OriginHostTopKModel.ts >= start_time, OriginHostTopKModel.ts <= end_time).delete()
            ResponderHostTopKModel.query.filter(
                ResponderHostTopKModel.ts >= start_time, ResponderHostTopKModel.ts <= end_time).delete()
            ResponderPortTopKModel.query.filter(
                ResponderPortTopKModel.ts >= start_time, ResponderPortTopKModel.ts <= end_time).delete()
            PortsOfInterestModel.query.filter(
                PortsOfInterestModel.ts >= start_time, PortsOfInterestModel.ts <= end_time).delete()
            ProtocolSumModel.query.filter(
                ProtocolSumModel.ts >= start_time, ProtocolSumModel.ts <= end_time).delete()
            ServiceSumModel.query.filter(
                ServiceSumModel.ts >= start_time, ServiceSumModel.ts <= end_time).delete()
            IPByteSumModel.query.filter(
                IPByteSumModel.ts >= start_time, IPByteSumModel.ts <= end_time).delete()
            ConnectionSumModel.query.filter(
                ConnectionSumModel.ts >= start_time, ConnectionSumModel.ts <= end_time).delete()
            db.session.commit()
        else:
            DNSTopKModel.query.delete()
            OriginHostTopKModel.query.delete()
            ResponderHostTopKModel.query.delete()
            ResponderPortTopKModel.query.delete()
            PortsOfInterestModel.query.delete()
            ProtocolSumModel.query.delete()
            ServiceSumModel.query.delete()
            IPByteSumModel.query.delete()
            ConnectionSumModel.query.delete()
            db.session.commit()
        return success_message()


api.add_resource(SummaryData, '/api/summary-data')


class Mode(Resource):
    @marshal_with(mode_resource_fields)
    def get(self):
        global active_mode
        data = {"mode": active_mode}
        return data

    @marshal_with(mode_resource_fields)
    def post(self):
        global active_mode
        args = mode_parser.parse_args()
        new_mode = args['mode']
        if is_pcap_processing() and new_mode == 'PCAP':
            abort(
                503, message="Cannot switch to pcap mode while another pcap file is processing")
        if active_mode != new_mode:
            create_db_if_not_exist(new_mode)
            set_sql_alchemy_binds_by_mode(new_mode)
            active_mode = new_mode
        data = {"mode": active_mode}
        return data


api.add_resource(Mode, '/api/mode')
