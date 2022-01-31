from pythia import db
from sqlalchemy.dialects.sqlite import FLOAT


class DNSModel(db.Model):
    __bind_key__ = 'detail'
    __tablename__ = 'dns'
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    uid = db.Column('uid', db.Text, db.ForeignKey(
        'conn.uid',  ondelete='CASCADE'), primary_key=True)
    query_text = db.Column('query', db.Text)
    q_answers = db.Column('answers', db.Text)
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
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    notice_uid = db.Column('uid', db.Text, db.ForeignKey(
        'conn.uid',  ondelete='CASCADE'), primary_key=True)
    note = db.Column('note', db.Text)
    msg = db.Column('msg', db.Text)

    def __repr__(self):
        return f"Notice({self.ts},'{self.note}','{self.msg}')"

    def get_response_name():
        return 'notices'


class ConnectionModel(db.Model):
    __bind_key__ = 'detail'
    __tablename__ = 'conn'
    ts = db.Column(FLOAT)
    dns_conn = db.relationship(
        DNSModel, backref="connection", passive_deletes=True)
    row_id = db.Column('rowid', db.Integer, primary_key=True)
    notice_conn = db.relationship(
        NoticeModel, backref="connection", passive_deletes=True)
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
