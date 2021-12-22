from pythia import db
from sqlalchemy.dialects.sqlite import FLOAT
from _datetime import datetime


class DNSModel(db.Model):
    __bind_key__ = 'detail'
    __tablename__ = 'dns'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    uid = db.Column('uid',db.String, primary_key=True)
    query_text = db.Column('query',db.String)
    q_answers = db.Column('answers',db.String)
    q_type = db.Column('qtype_name', db.String)
    q_rcode = db.Column('rcode_name', db.String)
    connection = db.relationship('ConnectionModel', uselist=False, lazy=False, viewonly=True)
    def __repr__(self):
        return f"DNS('{self.uid}','{self.query_text}','{self.answers}','{self.qtype_name}','{self.rcode_name}')"

    def get_response_name():
        return 'dNSConnections'

class ConnectionModel(db.Model):
    __bind_key__ = 'detail'
    __tablename__ = 'conn'
    ts = db.Column(FLOAT)
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    uid = db.Column(db.String, db.ForeignKey('dns.uid'),db.ForeignKey('notice.uid'), primary_key=True, )
    source = db.Column('id.orig_h', db.String)
    orig_p = db.Column('id.orig_p', db.String)
    target = db.Column('id.resp_h', db.String)
    resp_p = db.Column('id.resp_p', db.String)
    proto = db.Column('proto', db.String)
    service = db.Column('service', db.String)
    duration = db.Column(FLOAT)
    orig_ip_bytes = db.Column(db.Integer)
    resp_ip_bytes = db.Column(db.Integer)

    def __repr__(self):
        return f"Connection({self.ts},'{self.source}',{self.id_orig_p},'{self.target}',{self.id_resp_p},'{self.proto}') "

    def get_response_name():
        return 'connections'

class NoticeModel(db.Model):
    __bind_key__ = 'detail'
    __tablename__ = 'notice'
    ts = db.Column(FLOAT)
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    notice_uid = db.Column('uid',db.String)
    note = db.Column('note',db.String)
    msg = db.Column('msg', db.String)
    connection = db.relationship('ConnectionModel', uselist=False, lazy=False, viewonly=True)

    def __repr__(self):
        return f"Notice({self.ts},'{self.note}','{self.msg}')"
   
    def get_response_name():
        return 'notices'

class DNSTopKModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'dns_top_k'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    counter = db.Column(db.Integer)
    name = db.Column(db.String)

    def __repr__(self):
        return f"DnsTopKEntry('{self.name}',{self.counter}) "

class IPByteSumModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'ip_bytes_sum'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    counter = db.Column(db.Integer)
    name = db.Column(db.String)
    error_message = "Could not find any entries of IP kilobyte sum"

    def __repr__(self):
        return f"IPByteSumEntry('{self.name}',{self.counter}) "

    error_message = 'Could not find any connection entry'


class OriginHostTopKModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'origin_host_top_k'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    name = db.Column(db.String)
    counter = db.Column(db.Integer)
    
    error_message = "Could not find any entries of the top k origin hosts"

    def __repr__(self):
        return f"OriginHostTopKEntry('{self.name}',{self.counter}) "


class ResponderHostTopKModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'resp_host_top_k'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    name = db.Column(db.String)
    counter = db.Column(db.Integer)
    error_message = "Could not find any entries of the top k responder hosts"


    def __repr__(self):
        return f" ResponderHostTopKEntry('{name}',{counter}) "

class ResponderPortTopKModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'resp_port_top_k'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    resp_p = db.Column(db.Integer)
    proto = db.Column(db.String)
    counter = db.Column(db.Integer)
    error_message = "Could not find any entries of the top k responder ports"

    def __repr__(self):
        return f" ResponderHostTopKEntry({self.resp_p},{self.proto},{self.counter}) "


class ProtocolSumModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'proto_sum'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    name = db.Column(db.String)
    counter = db.Column(db.Integer)

    error_message = "Could not find any entries for protocol sum"

    def __repr__(self):
        return f" ProtocolSumEntry('{self.name}, {self.counter}) "

class ServiceSumModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'service_sum'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    name = db.Column(db.String)
    counter = db.Column(db.Integer)
    error_message = "Could not find any entries for service sum"

    def __repr__(self):
        return f" ServiceSumEntry('{self.name}, {self.counter}) "


class PortsOfInterestModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__= 'resp_poi_sum'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    resp_p = db.Column(db.Integer)
    proto = db.Column(db.String)
    counter = db.Column(db.Integer)

    error_message = "Could not find any entries for the ports of interest"

    def __repr__(self):
        return f" PortsOfInterestEntry({self.resp_p},{self.proto},{self.counter}) "

class ConnectionSumModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'connection_sum'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    ts = db.Column(FLOAT)
    counter = db.Column(db.Integer)
    
    error_message = 'Could not find any connection entry'

    def __repr__(self):
        return f" ConnectionSumEntry('{self.ts}',{self.counter})"

class DashboardModel(db.Model):
    __bind_key__ = 'view'
    __tablename__ = 'dashboard'
    name = db.Column(db.String,primary_key=True)
    view = db.relationship('ViewModel', backref='dashboard',cascade="all,delete",lazy=False)
    error_message = 'Could not find any dashboard entry'
    def __repr__(self):
        return f" DashboardEntry('{self.name}')"


class ViewModel(db.Model):
    __bind_key__ = 'view'
    __tablename__ = 'view'
    id = db.Column('chart_number', db.Integer, primary_key=True)
    dashboard_name = db.Column(db.String, db.ForeignKey('dashboard.name'))
    view = db.Column(db.String)
    view_type = db.Column('type',db.String)
    data_label = db.Column(db.String)
    view_label = db.Column(db.String)
    cols = db.Column(db.Integer)
    is_summary = db.Column(db.Boolean)
    is_frozen = db.Column(db.Boolean
    )
    error_message = 'Could not find any view entry'

    def __repr__(self):
        return f" View('{self.id}',{self.view}',{self.view_type},'{self.data_label}','{self.view_label}','{self.cols}')"


class StatusEntry:
    error_message = 'could not find zeek service'
    def __init__(self, name, type_value,host,status):
            self.name = name
            self.type = type_value
            self.host = host
            self.status = status

    def __repr__(self):
        return f" StatusEntry('{self.name}','{self.type}','{self.host}','{self.status}')"