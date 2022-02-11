from flask_restful import abort
from sqlalchemy import and_, or_, desc, func, types
from sqlalchemy.sql import func, expression
from pythia.Resources.DataResources import ConnectionModel, DNSModel, NoticeModel
from pythia.Parsing.DataParser import nested_table_filter_parser, nested_message_filter_parser, nested_negative_message_filter_parser, nested_filter_parser, nested_negative_filter_parser

PORTS_OF_INTEREST = ["10/tcp", "21/tcp", "22/tcp", "23/tcp", "25/tcp", "80/tcp", "110/tcp", "139/tcp", "443/tcp",
                     "445/tcp", "3389/tcp", "10/udp", "53/udp",
                     "67/udp", "123/udp", "135/udp", "137/udp", "138/udp", "161/udp", "445/udp", "631/udp", "1434/udp"]


'''
This function adds new query conditions for port filter
queries: list of query parts
args: filter
returns list of query parts.
'''


def create_filter_port_conditions(queries, args):
    if args['resp_p'] != None:
        ports = args['resp_p']
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_p ==
                               port[0], ConnectionModel.proto == (port[1])))
            else:
                queries.append(ConnectionModel.resp_p == port[0])
    if args['orig_p'] != None:
        ports = args['orig_p']
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_p ==
                               port[0], ConnectionModel.proto == (port[1])))
            else:
                queries.append(ConnectionModel.resp_p == port[0])
    return queries


'''
This function adds new query conditions for negative port filter
queries: list of query parts
args: negative filter
returns list of query parts.
'''


def create_negative_filter_port_conditions(queries, args):
    if args['resp_p'] != None:
        ports = args['resp_p']
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_p !=
                               port[0], ConnectionModel.proto != (port[1])))
            else:
                queries.append(ConnectionModel.resp_p != port[0])
    if args['orig_p'] != None:
        ports = args['orig_p']
        for port in ports:
            port = port.split('/')
            if len(port) > 1:
                queries.append(and_(ConnectionModel.resp_p !=
                               port[0], ConnectionModel.proto != (port[1])))
            else:
                queries.append(ConnectionModel.resp_p != port[0])
    return queries


'''
This function adds new query conditions for filter
queries: list of query parts
filters: filter
returns list of query parts.
'''


def create_filter_conditions(queries, filters):
    if filters['query_text'] != None:
        queries.append(func.lower(DNSModel.query_text).in_(
            filters['query_text']))
    if filters['q_type'] != None:
        queries.append(DNSModel.qtype_name.in_(filters['q_type']))
    if filters['q_rcode'] != None:
        queries.append(DNSModel.rcode_name.in_(filters['q_rcode']))
    if filters['q_answers'] != None:
        for elem in filters['q_answers']:
            queries.append(DNSModel.answers.ilike("%"+elem+"%"))
    if filters['start_time'] != None:
        queries.append(ConnectionModel.ts >= filters['start_time'])
    if filters['end_time'] != None:
        queries.append(ConnectionModel.ts <= filters['end_time'])
    if filters['source'] != None:
        queries.append(ConnectionModel.source.in_(filters['source']))
    if filters['target'] != None:
        queries.append(ConnectionModel.target.in_(filters['target']))
    if filters['proto'] != None:
        queries.append(func.lower(ConnectionModel.proto).in_(filters['proto']))
    if filters['service'] != None:
        # Checks if filter is Null value if yes combines other filters with Null query
        if any(x in filters['service'] for x in ['NULL', 'null', '-']):
            new_filter = [x for x in filters['service']
                          if x not in ['NULL', 'null', '-']]
            queries.append(or_(func.lower(ConnectionModel.service).in_(
                new_filter), ConnectionModel.service == None))
        else:
            queries.append(func.lower(
                ConnectionModel.service).in_(filters['service']))
    if filters['uid'] != None:
        queries.append(ConnectionModel.uid.in_(filters['uid']))
    if filters['orig_ip_bytes'] != None:
        create_comparison_filter_conditions(
            'orig_ip_bytes', filters['orig_ip_bytes'], queries)
    if filters['resp_ip_bytes'] != None:
        create_comparison_filter_conditions(
            'resp_ip_bytes', filters['resp_ip_bytes'], queries)
    if filters['duration'] != None:
        create_comparison_filter_conditions(
            'duration', filters['duration'], queries)
    return queries


'''
This function adds new query conditions for negative filter
queries: list of query parts
filters: negative filter
returns list of query parts.
'''


def create_negative_filter_conditions(queries, filters):
    if filters['query_text'] != None:
        queries.append(func.lower(DNSModel.query_text).notin_(
            filters['query_text']))
    if filters['q_type'] != None:
        queries.append(DNSModel.qtype_name.notin_(filters['q_type']))
    if filters['q_rcode'] != None:
        queries.append(DNSModel.rcode_name.notin_(filters['q_rcode']))
    if filters['q_answers'] != None:
        for elem in filters['q_answers']:
            queries.append(DNSModel.answers.notilike("%"+elem+"%"))
    if filters['source'] != None:
        queries.append(ConnectionModel.source.notin_(filters['source']))
    if filters['target'] != None:
        queries.append(ConnectionModel.target.notin_(filters['target']))
    if filters['proto'] != None:
        queries.append(func.lower(
            ConnectionModel.proto).notin_(filters['proto']))
    if filters['service'] != None:
        if any(x in filters['service'] for x in ['NULL', 'null', '-']):
            new_filter = [x for x in filters['service']
                          if x not in ['NULL', 'null', '-']]
            # Checks if filter is Null value if yes combines other filters with Null query
            queries.append(or_(func.lower(ConnectionModel.service).notin_(
                new_filter), ConnectionModel.service == None))
        else:
            queries.append(func.lower(
                ConnectionModel.service).notin_(filters['service']))

        queries.append(func.lower(
            ConnectionModel.service).notin_(filters['service']))
    if filters['uid'] != None:
        queries.append(ConnectionModel.uid.notin_(filters['uid']))
    if filters['orig_ip_bytes'] != None:
        create_negative_comparison_filter_conditions(
            'orig_ip_bytes', filters['orig_ip_bytes'], queries)
    if filters['resp_ip_bytes'] != None:
        create_negative_comparison_filter_conditions(
            'resp_ip_bytes', filters['resp_ip_bytes'], queries)
    if filters['duration'] != None:
        create_negative_comparison_filter_conditions(
            'duration', filters['duration'], queries)
    return queries


'''
This function adds new query conditions for comparison filter
filter_name: name of filter
filter_args: values of filter
queries: list of query parts
returns list of query parts.
'''


def create_comparison_filter_conditions(filter_name, filter_args, queries):
    for filter_value in filter_args:
        if filter_value.startswith('>'):
            filter_value = filter_value.strip().split('>', 1)[1]
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(
                getattr(ConnectionModel, filter_name) > filter_value)
        elif filter_value.startswith('<'):
            filter_value = filter_value.strip().split('<', 1)[1]
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(
                getattr(ConnectionModel, filter_name) < filter_value)

        elif filter_value.startswith('='):
            filter_value = filter_value.strip().split('=', 1)[1]
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(getattr(ConnectionModel, filter_name)
                           == filter_value)
        else:
            abort(400, message=filter_name +
                  ' filter has wrong format. It must start with < or > or =')


'''
This function adds new query conditions for negative comparison filter
filter_name: name of negative filter
filter_args: values of negative filter
queries: list of query parts
returns list of query parts.
'''


def create_negative_comparison_filter_conditions(filter_name, filter_args, queries):
    for filter_value in filter_args:
        if filter_value.startswith('>'):
            filter_value = filter_value.split('>')
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(
                getattr(ConnectionModel, filter_name) < filter_value)
        elif filter_value.startswith('<'):
            filter_value = filter_value.split('<')
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(
                getattr(ConnectionModel, filter_name) > filter_value)

        elif filter_value.startswith('='):
            filter_value = filter_value.split('=')
            try:
                float(filter_value)
            except:
                abort(400, message=filter_name + ' filter has wrong format')
            queries.append(getattr(ConnectionModel, filter_name)
                           != filter_value)
        else:
            abort(400, message=filter_name +
                  ' filter has wrong format. It must start with < or > or =')


'''
This function adds new query conditions for notice filter
queries: list of query parts
filter: notice filter
negative_filter: negative notice filter
returns list of query parts.
'''


def create_notice_filter_conditions(queries, filters, negative_filters):
    if filters['start_time'] != None:
        queries.append(NoticeModel.ts >= filters['start_time'])
    if filters['end_time'] != None:
        queries.append(NoticeModel.ts <= filters['end_time'])
    if filters['notice_target'] != None:
        queries.append(ConnectionModel.target.in_(filters['notice_target']))
    if filters['notice_source'] != None:
        queries.append(ConnectionModel.source.in_(filters['notice_source']))
    if filters['notice_header'] != None:
        queries.append(NoticeModel.note.in_(filters['notice_header']))
    if filters['notice_uid'] != None:
        queries.append(NoticeModel.notice_uid.in_(filters['notice_uid']))
    if negative_filters['notice_target'] != None:
        queries.append(ConnectionModel.target.notin_(filters['notice_target']))
    if negative_filters['notice_source'] != None:
        queries.append(ConnectionModel.source.notin_(filters['notice_source']))
    if negative_filters['notice_header'] != None:
        queries.append(NoticeModel.note.notin_(filters['notice_header']))
    if negative_filters['notice_uid'] != None:
        queries.append(NoticeModel.notice_uid.notin_(filters['notice_uid']))
    return queries


'''
This function adds new query for sort functionality in tables
args: comparison filter
query: list of query parts
model: model which starts query
returns list of query parts.
'''


def get_sort_query(args, query, model):
    if 'target' in args["sortBy"][0]:
        sort_value = getattr(ConnectionModel, 'target')
    elif 'source' in args["sortBy"][0]:
        sort_value = getattr(ConnectionModel, 'source')
    elif 'ts' == args["sortBy"][0]:
        if model == NoticeModel:
            sort_value = getattr(NoticeModel, 'ts')
        else:
            sort_value = getattr(ConnectionModel, 'ts')
    else:
        sort_value = getattr(model, args["sortBy"][0])
    if args['sortDesc']:
        return query.order_by(desc(sort_value))
    return query.order_by(sort_value)


'''
This function adds new query for sort functionality in tables
args: arguments for filter and table
model: model which starts query
returns table data object.
'''


def create_table_response(args, model):
    session = model.query
    table_filter = nested_table_filter_parser.parse_args(req=args)

    if model == NoticeModel:
        filters = nested_message_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_message_filter_parser.parse_args(
            req=args)

        session = apply_notice_filters_to_query(
            session, filters, negative_filters)

    else:
        filters = nested_filter_parser.parse_args(req=args)
        negative_filters = nested_negative_filter_parser.parse_args(req=args)

        session = apply_default_filters_to_query(
            session, filters, negative_filters)

    session = join_models_if_necessary(
        session, model, filters, negative_filters, table_filter['sortBy'])

    if table_filter['sortBy'] != None:
        session = get_sort_query(table_filter, session, model)

    data = session.paginate(
        page=table_filter['page'], per_page=table_filter['itemsPerPage'], max_per_page=None, error_out=False).items
    total = session.paginate().total
    data = {model.get_response_name(): data}
    data['total'] = total
    return data


'''
This function creates a query for top k summary requests
queries: list of query parts
args: arguments for filter
model: model which starts query
returns query.
'''


def create_top_k_summary_query(queries, args, model):
    queries = filter_time_for_query(queries, args, model)
    return model.query.session.query(model.name, func.sum(model.counter).label('counter')).filter(*queries).group_by(model.name).order_by(desc('counter'))


'''
This function creates a query for top k detail requests
model: model which starts query
args: arguments for filter
count_attribute: argument to be counted
returns query.
'''


def create_top_k_detail_query(model, args, count_attribute):
    filters = nested_filter_parser.parse_args(req=args)
    negative_filters = nested_negative_filter_parser.parse_args(req=args)
    session = model.query.session.query(count_attribute.label(
        'name'), func.count().label('counter'))
    session = join_models_if_necessary(
        session, model, filters, negative_filters)
    session = apply_default_filters_to_query(
        session, filters, negative_filters)
    return session.group_by('name').order_by(desc('counter'))


'''
This function creates a query for detail requests with time
model: model which starts query
queries: list of query parts
args: arguments for filter
timeunit: string representation of timeformat
returns query.
'''


def create_by_time_detail_query(model, queries, args, timeunit):
    filters = nested_filter_parser.parse_args(req=args)
    negative_filters = nested_negative_filter_parser.parse_args(req=args)
    queries = join_models_if_necessary(
        queries, model, filters, negative_filters)
    queries = apply_default_filters_to_query(
        queries, filters, negative_filters)
    return queries.group_by(func.strftime(timeunit, model.ts, 'unixepoch')).order_by(model.ts)


'''
This function creates a query for summary requests with time
queries: list of query parts
args: arguments for filter
model: model which starts query
timeunit: string representation of timeformat
returns query.
'''


def create_by_time_summary_query(queries, args, model, timeunit):
    queries = filter_time_for_query(queries, args, model)
    session = model.query.session.query(model.ts.label(
        'ts'), func.sum(model.counter).label('counter'))
    return session.filter(*queries).group_by(func.strftime(timeunit, model.ts, 'unixepoch')).order_by(model.ts)


'''
This function creates a query for top k port summary requests 
queries: list of query parts
args: arguments for filter
model: model which starts query
returns query.
'''


def create_top_k_port_summary_query(queries, args, model):
    queries = filter_time_for_query(queries, args, model)
    return model.query.session.query((expression.cast(model.resp_p, types.Unicode) + '/' + model.proto).label('name'), func.sum(model.counter).label('counter')).filter(*queries).group_by('name').order_by(desc('counter'))


'''
This function creates a query for top k port detail requests 
filters: filters to be applied
negative_filters: negative filters to be applied
returns query.
'''


def create_top_k_port_detail_query(filters, negative_filters):
    session = ConnectionModel.query.session.query((expression.cast(
        ConnectionModel.resp_p, types.Unicode) + '/' + ConnectionModel.proto).label('name'), func.count("name").label('counter'))
    session = join_models_if_necessary(
        session, ConnectionModel, filters, negative_filters)
    queries = apply_default_filters_to_query(
        session, filters, negative_filters)
    queries = queries.group_by('name').order_by(desc('counter'))
    return queries


'''
This function applies all default filters to query
session: session to which filter should be applied
filters: filters to be applied
negative_filters: negative filters to be applied
returns query.
'''


def apply_default_filters_to_query(session, filters, negative_filters):
    negative_queries = create_negative_filter_conditions([], negative_filters)
    queries = create_filter_conditions(negative_queries, filters)
    negative_port_queries = create_negative_filter_port_conditions(
        [], negative_filters)
    port_queries = create_filter_port_conditions(
        negative_port_queries, filters)
    queries = session.filter(*queries).filter(or_(*port_queries))
    return queries


'''
This function applies notice filters to query
session: session to which filter should be applied
filters: notice filters to be applied
negative_filters: negative notice filters to be applied
returns query.
'''


def apply_notice_filters_to_query(session, filters, negative_filters):
    queries = create_notice_filter_conditions([], filters, negative_filters)
    queries = session.filter(*queries)
    return queries


'''
This function joins models for cross table queries
session: session to which filter should be applied
filters: notice filters to be applied
negative_filters: negative notice filters to be applied
connection_sort: sort value or None
returns session.
'''


def join_models_if_necessary(session, model, filters, negative_filters, connection_sort=None):
    if model == NoticeModel:
        if notice_args_contain_connection_filter(filters) or notice_args_contain_connection_filter(negative_filters) or notice_is_sort_by_connection(connection_sort):
            return session.outerjoin(ConnectionModel)
        else:
            return session
    elif model == DNSModel:
        return session.outerjoin(ConnectionModel)
    elif args_contain_dns_filter(filters) or args_contain_dns_filter(negative_filters):
        return session.distinct().join(DNSModel)
    else:
        return session


'''
This function  filters query by time
queries: list of query parts
args: arguments for filter
model: model which starts query
returns queries.
'''


def filter_time_for_query(queries, args, model):
    start_time = args.get('start-time')
    end_time = args.get('end-time')
    if start_time != None:
        queries.append(model.ts >= start_time)
    if end_time != None:
        queries.append(model.ts <= end_time)
    return queries


'''
This function checks if arguments contain dns filter
filters: filters to be applied
returns boolean.
'''


def args_contain_dns_filter(filters):
    return filters['query_text'] != None or filters['q_answers'] != None or filters['q_type'] != None or filters['q_rcode']


'''
This function checks if arguments contain connection filter for notices
filters: filters to be applied
returns boolean.
'''


def notice_args_contain_connection_filter(filters):
    return filters['notice_target'] != None or filters['notice_source'] != None


'''
This function checks if sort_value is by connection value
sort_value: value to be sorted
returns boolean.
'''


def notice_is_sort_by_connection(sort_value):
    if sort_value == None:
        return False
    return 'notice_target' in sort_value or 'notice_source' in sort_value


'''
This function adds the PORTS_OF_INTEREST to port filter
filters: filters to be applied
returns filters.
'''


def add_ports_of_interest_to_filter(filters):
    if filters['resp_p'] != None:
        port_args = set(filters['resp_p'])
        filters['resp_p'] = [
            value for value in PORTS_OF_INTEREST if value in port_args]
    else:
        filters['resp_p'] = PORTS_OF_INTEREST
    return filters
