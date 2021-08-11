from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import cross_origin
import pandas as pd

app = Flask(__name__)

cross_origin(["http://localhost", "http://127.0.0.1","10.0.0.30"])

@app.route('/',methods=['GET'])
def index():
    return

@app.route('/connections',methods=['GET'])
@cross_origin(cross_origin)
def getConnections():
    start = request.args.get('start')
    end = request.args.get('end')
        
    if start == None or end == None:
            connection_info = get_all_connections('C:/temp/2021-07-11/pythia-conn.log')
            return jsonify(connection_info)

    else: 
        start = float(request.args.get('start'))/1000
        end = float(request.args.get('end'))/1000
        connection_info = get_timespan_connections('C:/temp/2021-07-11/pythia-conn.log', start, end)
        return jsonify(connection_info)

@app.route('/notices',methods=['GET'])
@cross_origin(cross_origin)
def getNotices():
    start = request.args.get('start')
    end = request.args.get('end')

    if start == None or end == None:
        print("test2")
        notice_info = get_all_notices('C:/temp/2021-07-11/pythia-notice.12-00-00-13-00-00.log')
        return jsonify(notice_info)

    else: 
        print("test")
        start = float(request.args.get('start'))/1000
        end = float(request.args.get('end'))/1000
        notice_info = get_timespan_notices('C:/temp/2021-07-11/pythia-notice.12-00-00-13-00-00.log', start, end)
        return jsonify(notice_info)


def get_protocol_sum(file_path):
    index = ["ts","source","id.orig_p","target","id.resp_p","proto","service","orig_pkts","resp_pkts"]
    df = pd.read_csv(file_path, sep='\t',skiprows=(0,1,2,3,4,5,6,7),skipfooter=1,names=index, engine="python")
    return df.proto.value_counts().to_dict()


def get_timespan_notices(file_path, start, end):
    index = ["ts","uid","note","msg"]
    df = pd.read_csv(file_path, sep='\t',skiprows=(0,1,2,3,4,5,6,7),skipfooter=1,names=index, engine="python")
    df = df[(df.ts >= start) & (df.ts <= end)]
    return df.to_dict(orient='records')

def get_all_notices(file_path):
    index = ["ts","uid","note","msg"]
    df = pd.read_csv(file_path, sep='\t',skiprows=(0,1,2,3,4,5,6,7),skipfooter=1,names=index, engine="python")
    return df.to_dict(orient='records')

def get_timespan_connections(file_path, start, end):
    index = ["ts",'uid',"source","id.orig_p","target","id.resp_p","proto","service","orig_pkts","resp_pkts"]
    df = pd.read_csv(file_path, sep='\t',skiprows=(0,1,2,3,4,5,6,7),skipfooter=1,names=index, engine="python")
    df = df[(df.ts >= start) & (df.ts <= end)]
    return df.to_dict(orient='records')

def get_all_connections(file_path):
    index = ["ts",'uid',"source","id.orig_p","target","id.resp_p","proto","service","orig_pkts","resp_pkts"]
    df = pd.read_csv(file_path, sep='\t',skiprows=(0,1,2,3,4,5,6,7),skipfooter=1,names=index, engine="python")
    return df.to_dict(orient='records')

if __name__ == "__main__":
   app.run(debug=True)