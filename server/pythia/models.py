from pythia import db
from sqlalchemy.dialects.sqlite import FLOAT

class DnsModel(db.Model):
    __tablename__ = 'dns'
    uid = db.Column('uid',db.String, primary_key=True)
    query_text = db.Column('query',db.String, primary_key=True)
    qtype_name = db.Column('qtype_name', db.String)
    rcode_name = db.Column('rcode_name', db.String)
    connection = db.relationship('ConnectionModel', uselist=False, lazy=True, viewonly=True)

    def __repr__(self):
        return f"DNS('{self.uid}','{self.query_text}','{self.qtype_name}','{self.rcode_name}')"

class ConnectionModel(db.Model):
    __tablename__ = 'conn'
    ts = db.Column(FLOAT)
    uid = db.Column(db.String, db.ForeignKey('dns.uid'),db.ForeignKey('notice.uid'), primary_key=True, )
    origin_host = db.Column('id.orig_h', db.String)
    origin_port = db.Column('id.orig_p', db.String)
    resp_host = db.Column('id.resp_h', db.String)
    resp_port = db.Column('id.resp_p', db.String)
    proto = db.Column('proto', db.String)
    service = db.Column('service', db.String)
    duration = db.Column(FLOAT)
    orig_ip_bytes = db.Column(db.Integer)
    resp_ip_bytes = db.Column(db.Integer)

    def __repr__(self):
        return f"Connection({self.ts},'{self.origin_host}',{self.origin_port},'{self.resp_host}',{self.resp_port},'{self.proto}') "

class NoticeModel(db.Model):
    __tablename__ = 'notice'
    ts = db.Column(FLOAT ,primary_key=True)
    uid = db.Column('uid',db.String, primary_key=True)
    note = db.Column('note',db.String)
    msg = db.Column('msg', db.String)

    def __repr__(self):
        return f"Notice({self.ts},'{self.note}','{self.msg}')"


class DNSTopKEntry:
    error_message = "Could not find any entries of the top k dns queries"

    def __init__(self,query_text,counter):
        self.counter = counter
        self.query_text = query_text

    def __repr__(self):
        return f"DnsTopKEntry('{self.query_text}',{self.counter}) "

class IPKilobyteSumEntry:
    error_message = "Could not find any entries of IP kilobyte sum"

    def __init__(self,name,counter):
        self.counter = counter
        self.name = name

    def __repr__(self):
        return f"IPKilobyteSumEntry('{self.name}',{self.counter}) "

class OriginHostTopKEntry:
    error_message = "Could not find any entries of the top k origin hosts"

    def __init__(self,host,counter):
        self.counter = counter
        self.host = host

    def __repr__(self):
        return f"OriginHostTopKEntry('{self.host}',{self.counter}) "


class ResponderHostTopKEntry:
    error_message = "Could not find any entries of the top k responder hosts"

    def __init__(self,host,counter):
        self.counter = counter
        self.host = host

    def __repr__(self):
        return f" ResponderHostTopKEntry('{self.host}',{self.counter}) "

class ResponderPortTopKEntry:
        error_message = "Could not find any entries of the top k responder ports"

        def __init__(self, port, protocol, counter):
            self.counter = counter
            self.p = port
            self.prot = protocol

        def __repr__(self):
            return f" ResponderHostTopKEntry({self.p}/{self.prot},{self.counter}) "


class ProtocolSumEntry:
    error_message = "Could not find any entries for protocol sum"

    def __init__(self, protocol, counter):
        self.counter = counter
        self.prot = protocol

    def __repr__(self):
        return f" ProtocolSumEntry('{self.prot}, {self.counter}) "

class ServiceSumEntry:
    error_message = "Could not find any entries for service sum"

    def __init__(self, service, counter):
        self.counter = counter
        self.service = service

    def __repr__(self):
        return f" ServiceSumEntry('{self.service}, {self.counter}) "


class PortsOfInterestEntry:
    error_message = "Could not find any entries for the ports of interest"

    def __init__(self, port, protocol, counter):
        self.counter = counter
        self.p = port
        self.prot = protocol

    def __repr__(self):
        return f" PortsOfInterestEntry({self.p}/{self.prot},{self.counter}) "