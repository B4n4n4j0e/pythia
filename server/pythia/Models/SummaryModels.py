from pythia import db
from sqlalchemy.dialects.sqlite import FLOAT


class DNSTopKModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'dns_top_k'
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    ts = db.Column(FLOAT)
    counter = db.Column(db.Integer)
    name = db.Column(db.String)

    def __repr__(self):
        return f"DnsTopKEntry('{self.name}',{self.counter}) "


class IPByteSumModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'ip_bytes_sum'
    row_id = db.Column('rowid', db.Integer, primary_key=True)
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
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    ts = db.Column(FLOAT)
    name = db.Column(db.String)
    counter = db.Column(db.Integer)

    error_message = "Could not find any entries of the top k origin hosts"

    def __repr__(self):
        return f"OriginHostTopKEntry('{self.name}',{self.counter}) "


class ResponderHostTopKModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'resp_host_top_k'
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    ts = db.Column(FLOAT)
    name = db.Column(db.String)
    counter = db.Column(db.Integer)
    error_message = "Could not find any entries of the top k responder hosts"

    def __repr__(self):
        return f" ResponderHostTopKEntry('{name}',{counter}) "


class ResponderPortTopKModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'resp_port_top_k'
    row_id = db.Column('rowid', db.Integer, primary_key=True)
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
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    ts = db.Column(FLOAT)
    name = db.Column(db.String)
    counter = db.Column(db.Integer)

    error_message = "Could not find any entries for protocol sum"

    def __repr__(self):
        return f" ProtocolSumEntry('{self.name}, {self.counter}) "


class ServiceSumModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'service_sum'
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    ts = db.Column(FLOAT)
    name = db.Column(db.String)
    counter = db.Column(db.Integer)
    error_message = "Could not find any entries for service sum"

    def __repr__(self):
        return f" ServiceSumEntry('{self.name}, {self.counter}) "


class PortsOfInterestModel(db.Model):
    __bind_key__ = 'summary'
    __tablename__ = 'resp_poi_sum'
    row_id = db.Column('rowid', db.Integer, primary_key=True)
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
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    ts = db.Column(FLOAT)
    counter = db.Column(db.Integer)

    error_message = 'Could not find any connection entry'

    def __repr__(self):
        return f" ConnectionSumEntry('{self.ts}',{self.counter})"
