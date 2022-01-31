from pythia import db
from sqlalchemy.dialects.sqlite import FLOAT


class DNSModel(db.Model):
    __bind_key__ = 'detail'
    __tablename__ = 'dns'
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    uid = db.Column('uid', db.Text,db.ForeignKey('conn.uid',  ondelete='CASCADE'), primary_key=True)
    query_text = db.Column('query',db.Text)
    q_answers = db.Column('answers',db.Text)
    q_type = db.Column('qtype_name', db.Text)
    q_rcode = db.Column('rcode_name', db.Text)
    def __repr__(self):
        return f"DNS('{self.uid}','{self.query_text}','{self.answers}','{self.qtype_name}','{self.rcode_name}')"

    def get_response_name():
        return 'dNSConnections'


class NoticeModel(db.Model):
    __bind_key__ = 'detail'
    __tablename__ = 'notice'
    ts = db.Column(FLOAT)
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    notice_uid = db.Column('uid', db.Text,db.ForeignKey('conn.uid',  ondelete='CASCADE'), primary_key=True)
    note = db.Column('note',db.Text)
    msg = db.Column('msg', db.Text)

    def __repr__(self):
        return f"Notice({self.ts},'{self.note}','{self.msg}')"
   
    def get_response_name():
        return 'notices'

class ConnectionModel(db.Model):
    __bind_key__ = 'detail'
    __tablename__ = 'conn'
    ts = db.Column(FLOAT)
    dns_conn = db.relationship(DNSModel, backref="connection", passive_deletes=True)
    row_id = db.Column('rowid',db.Integer,primary_key=True)
    notice_conn = db.relationship(NoticeModel, backref="connection", passive_deletes=True)
    uid = db.Column(db.String, primary_key=True)
    source = db.Column('id.orig_h', db.Text)
    orig_p = db.Column('id.orig_p', db.Integer)
    target = db.Column('id.resp_h', db.Text)
    resp_p = db.Column('id.resp_p', db.Integer)
    proto = db.Column('proto', db.Text)
    service = db.Column('service', db.Text)
    duration = db.Column(FLOAT)
    orig_ip_bytes = db.Column(db.BigInteger)
    resp_ip_bytes = db.Column(db.BigInteger)

    def __repr__(self):
        return f"Connection({self.ts},'{self.source}',{self.orig_p},'{self.target}',{self.resp_p},'{self.proto}') "

    def get_response_name():
        return 'connections'



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


class StatusEntry:
    error_message = 'could not find zeek service'
    def __init__(self, name, type_value,host,status):
            self.name = name
            self.type = type_value
            self.host = host
            self.status = status

    def __repr__(self):
        return f" StatusEntry('{self.name}','{self.type}','{self.host}','{self.status}')"