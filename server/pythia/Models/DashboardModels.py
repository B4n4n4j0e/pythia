from pythia import db


class DashboardModel(db.Model):
    __bind_key__ = 'view'
    __tablename__ = 'dashboard'
    name = db.Column(db.String, primary_key=True)
    view = db.relationship('ViewModel', backref='dashboard',
                           cascade="all,delete", lazy=False)
    error_message = 'Could not find any dashboard entry'

    def __repr__(self):
        return f" DashboardEntry('{self.name}')"


class ViewModel(db.Model):
    __bind_key__ = 'view'
    __tablename__ = 'view'
    id = db.Column('chart_number', db.Integer, primary_key=True)
    dashboard_name = db.Column(db.String, db.ForeignKey('dashboard.name'))
    view = db.Column(db.String)
    view_type = db.Column('type', db.String)
    data_label = db.Column(db.String)
    view_label = db.Column(db.String)
    cols = db.Column(db.Integer)
    is_summary = db.Column(db.Boolean)
    is_frozen = db.Column(db.Boolean
                          )
    error_message = 'Could not find any view entry'

    def __repr__(self):
        return f" View('{self.id}',{self.view}',{self.view_type},'{self.data_label}','{self.view_label}','{self.cols}')"
