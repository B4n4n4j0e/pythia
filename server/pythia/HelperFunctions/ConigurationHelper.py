from flask_restful import abort
from flask import current_app
from subprocess import check_output, run, call, PIPE
import re
from shutil import move
from os import getenv, path, access, X_OK, W_OK, environ, path
from dotenv import set_key, find_dotenv, load_dotenv
from pythia.HelperFunctions.MaintainDatabaseHelper import delete_table_entries_by_type, create_database_by_type
from pythia.CustomExceptions.PythiaDatabaseError import PythiaDatabaseError

dotenv_file = find_dotenv()
load_dotenv(dotenv_file)
active_mode = 'Sensor'


class StatusEntry:
    error_message = 'could not find zeek service'

    def __init__(self, name, type_value, host, status):
        self.name = name
        self.type = type_value
        self.host = host
        self.status = status

    def __repr__(self):
        return f" StatusEntry('{self.name}','{self.type}','{self.host}','{self.status}')"


'''
This function changes sqlbinds depending on mode
mode: should be sensor or pcap
returns .
'''


def set_sql_alchemy_binds_by_mode(mode):
    detail_bind = 'sqlite:///' + get_detail_db_path_by_mode(mode)
    summary_bind = 'sqlite:///' + get_summary_db_path_by_mode(mode)
    current_app.config["SQLALCHEMY_BINDS"]['detail'] = detail_bind
    current_app.config["SQLALCHEMY_BINDS"]['summary'] = summary_bind


'''
This function creates summary db path depending on mode
mode: should be sensor or pcap
returns  path as string.
'''


def get_summary_db_path_by_mode(mode):
    if mode == "Sensor":
        return getenv("PYTHIA_PATH") + '/pythia_summary.sqlite'
    elif mode == "PCAP":
        return getenv("PYTHIA_PCAP_PATH") + '/pythia_summary_pcap.sqlite'
    else:
        abort(404, message='Mode does not exist')


'''
This function creates detail db path depending on mode
mode: should be sensor or pcap
returns path as string.
'''


def get_detail_db_path_by_mode(mode):
    if mode == "Sensor":
        return getenv("PYTHIA_PATH") + '/pythia.sqlite'
    elif mode == "PCAP":
        return getenv("PYTHIA_PCAP_PATH") + '/pythia_pcap.sqlite'
    else:
        abort(404, message='Mode does not exist')


'''
This function creates sqlite3 databases if they don't exist
mode: should be sensor or pcap
returns .
'''


def create_db_if_not_exist(mode):
    detail_path = get_detail_db_path_by_mode(mode)
    summary_path = get_summary_db_path_by_mode(mode)
    if not path.isfile(detail_path):
        try:
            create_database_by_type(detail_path, 'detail')
        except PythiaDatabaseError as error:
            abort(500, message=error.message)
    if not path.isfile(summary_path):
        try:
            create_database_by_type(summary_path, 'summary')
        except PythiaDatabaseError as error:
            abort(500, message=error.message)


'''
This function creates configuration object depending on mode and environment variables
returns object with config data.
'''


def get_config_from_env():
    if active_mode == 'Sensor':
        script_name = "PYTHIA_CONFIG"
        path_name = "PYTHIA_PATH"
    elif active_mode == 'PCAP':
        script_name = "PYTHIA_PCAP_CONFIG"
        path_name = "PYTHIA_PCAP_PATH"
    else:
        abort(500, message="Api service of Pythia is faulty")
    path = getenv(path_name)
    network_scan_detection = ":SCAN:" in getenv(script_name)
    traceroute_detection = ":TRACEROUTE:" in getenv(script_name)
    detail = ":NODETAIL:" not in getenv(script_name)
    summary = ":NOSUMMARY:" not in getenv(script_name)

    data = {
        "path": path,
        "network_scan_detection": network_scan_detection,
        "traceroute_detection": traceroute_detection,
        "detail": detail,
        "summary": summary
    }

    return data


'''
This function returns size of db
new_path: path of db file
returns int.
'''


def get_db_size(new_path):
    try:
        return path.getsize(new_path)
    except OSError:
        return 0


'''
This function checks if pcap file is currently processing
returns boolean.
'''


def is_pcap_processing():
    zeek_location = environ['ZEEK_LOCATION'] + '/bin/zeek'
    cmd = 'ps -aux | grep -E "' + zeek_location + ' -r"' + '| grep -v "grep" | wc -l'
    zeek_processes = int(check_output(cmd, shell=True))
    return (zeek_processes > 0)


'''
This function checks for zeekstatus
returns array with StatusEntry objects.
'''


def get_zeek_status():
    try:
        zeekctl_location = environ['ZEEK_LOCATION'] + '/bin/zeekctl'
        result = run(
            [zeekctl_location, 'status'], stdout=PIPE)
    except FileNotFoundError:
        abort(500, message=StatusEntry.error_message)
    output = result.stdout.decode('utf-8')
    lines = re.split(r'\n+', output)
    result = []
    for line in lines[1:len(lines)-1]:
        line = re.split(r'\s+', line)
        result.append(StatusEntry(line[0], line[1], line[2], line[3]))
    return result


'''
This function checks if config changes are valid
args: array of new config elements
returns new config dictionary.
'''


def create_config_change_list(args):
    new_path = args['path']
    new_network_scan_detection = args['network_scan_detection']
    new_traceroute_detection = args['traceroute_detection']
    new_detail = args['detail']
    new_summary = args['summary']

    new_config = {}
    current_config = get_config_from_env()

    if new_path != current_config['path']:
        if not access(path.normpath(new_path), X_OK | W_OK):
            abort(400, message="Path does not exist or no write permissions for path")
        new_config["PATH"] = new_path
    if new_network_scan_detection != current_config['network_scan_detection']:
        if new_network_scan_detection:
            new_config[":SCAN:"] = "add"
        else:
            new_config[":SCAN:"] = "remove"
    if new_traceroute_detection != current_config['traceroute_detection']:
        if new_traceroute_detection:
            new_config[":TRACEROUTE:"] = "add"
        else:
            new_config[":TRACEROUTE:"] = "remove"
    if new_detail != current_config['detail']:
        if new_detail:
            new_config[":NODETAIL:"] = "remove"
        else:
            new_config[":NODETAIL:"] = "add"
    if new_summary != current_config["summary"]:
        if new_summary:
            new_config[':NOSUMMARY:'] = "remove"
        else:
            new_config[":NOSUMMARY:"] = "add"
    return new_config


'''
This function applies config and sets environment variables
new_config: new config dictionary
returns .
'''


def save_config(new_config):
    if len(new_config) == 0:
        return
    if active_mode == 'Sensor':
        script_name = "PYTHIA_CONFIG"
        path_name = "PYTHIA_PATH"
        stop_zeek()
    elif active_mode == 'PCAP':
        script_name = "PYTHIA_PCAP_CONFIG"
        path_name = "PYTHIA_PCAP_PATH"
    else:
        abort(500, message="Api service of Pythia is faulty")
    script_value = getenv(script_name)
    path = getenv(path_name)

    old_summary_path = get_summary_db_path_by_mode(active_mode)
    old_detail_path = get_detail_db_path_by_mode(active_mode)
    old_path = getenv(path_name)

    path_pattern = re.compile(r'^\/((\/$)|((\w+\/)*\w+$)|$)')
    for key in new_config:
        if new_config[key] == "add":
            script_value += key
        elif new_config[key] == "remove":
            script_value = script_value.replace(key, "")
        elif key == "PATH" and bool(path_pattern.match(new_config[key])):
            path = new_config[key]
    environ[path_name] = path
    environ[script_name] = script_value
    write_config_to_file(path_name, script_name)
    if old_path != path:
        # change path for sql_binds
        set_sql_alchemy_binds_by_mode(active_mode)
        # move db to new locationt
        move(old_summary_path, get_summary_db_path_by_mode(active_mode))
        move(old_detail_path, get_detail_db_path_by_mode(active_mode))
    if active_mode == "Sensor":
        deploy_zeek()


'''
This function writes config changes to .env file
path_name: new config path
script_name: new scripts configuration
returns .
'''


def write_config_to_file(path_name, script_name):
    set_key(dotenv_file, path_name,  environ[path_name])
    set_key(dotenv_file, script_name, environ[script_name])


'''
This function stops zeekctl
returns .
'''


def stop_zeek():
    try:
        zeekctl_location = environ['ZEEK_LOCATION'] + '/bin/zeekctl'
        result = call([zeekctl_location, 'stop'],
                      stdout=PIPE)
        if result != 0:
            abort(500, message="Could not stop zeek")
    except FileNotFoundError:
        abort(500, message='Zeek is not installed or an incorrect path is specified ')


'''
This function deploys zeekctl
returns .
'''


def deploy_zeek():
    try:
        my_env = environ.copy()
        zeekctl_location = environ['ZEEK_LOCATION'] + '/bin/zeekctl'
        result = call(
            [zeekctl_location, 'deploy'], env=my_env, stdout=PIPE)
        if result != 0:
            abort(500, message="Could not deploy zeek")
    except FileNotFoundError:
        abort(500, message="Zeek is not installed or an incorrect path is specified")


'''
This function runs zeek on pcap
path: path to pcap file
returns .
'''


def process_zeek(path):
    if not is_pcap_processing():
        detail_path = get_detail_db_path_by_mode('PCAP')
        summary_path = get_summary_db_path_by_mode('PCAP')
        try:
            delete_table_entries_by_type(detail_path, 'detail')
            delete_table_entries_by_type(summary_path, 'summary')
        except PythiaDatabaseError as error:
            abort(500, message=error.message)
    else:
        abort(503, message='Still processing another PCAP file, please try again later')
    try:
        zeek_location = environ['ZEEK_LOCATION'] + '/bin/zeek'
        my_env = environ.copy()
        my_env['PYTHIA_ZEEK_MODE'] = 'pcap'
        p = call([zeek_location, '-r' + path, 'local'],
                 env=my_env, stdout=PIPE)
        if p != 0:
            abort(503, message='Something went wrong while processing the file')
    except FileNotFoundError:
        abort(500, message=StatusEntry.error_message)
