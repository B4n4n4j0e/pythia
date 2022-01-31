import sqlite3
from sqlite3 import Error
from pythia.CustomExceptions.PythiaDatabaseError import PythiaDatabaseError

''' 
create a database connection to the SQLite database
db_file: database file
returns Connection object or None.
'''


def create_connection(db_file):

    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Exception:
        conn.close()
        raise PythiaDatabaseError(
            'Connection to %s failed, please check if database exists' % (db_file))


''' 
deletes a table from the delete_tables_sql statement
conn: Connection object
create_table_sql: an array of DELETE TABLE entries statements
returns .
'''


def delete_table_entries(conn, delete_tables_entries_sql):

    try:
        c = conn.cursor()
        for delete_table_entry_sql in delete_tables_entries_sql:
            c.execute(delete_table_entry_sql)
    except Exception:
        c.execute("rollback")
        raise PythiaDatabaseError('Failed to execute: %s' %
                                  (delete_table_entry_sql))


''' 
create a table from the create_table_sql statement
conn: Connection object
create_table_sql: an array of CREATE TABLE statements
returns .
'''


def create_tables(conn, create_tables_sql):

    try:
        c = conn.cursor()
        for create_table_sql in create_tables_sql:
            c.execute(create_table_sql)
    except Error as e:
        c.execute("rollback")
        raise PythiaDatabaseError('Failed to execute: %s' % (create_table_sql))


''' 
set pragma on for foreign keys
conn: Connection object
returns .
'''


def set_pragma_foreign_keys(conn):
    try:
        c = conn.cursor()
        c.execute('PRAGMA foreign_keys=ON')
    except Error as e:
        c.execute("rollback")
        raise PythiaDatabaseError(
            'Foreign keys are not set, please recreate the database')


''' 
deletes table entries 
database_path: path to databases
database_type: type of database
returns .
'''


def delete_table_entries_by_type(database_path, database_type):
    tables = []
    if database_type == 'detail':
        sql_delete_conn_entries = "DELETE FROM conn;"
        tables.append(sql_delete_conn_entries)
        sql_delete_dns_entries = "DELETE FROM dns;"
        tables.append(sql_delete_dns_entries)
        sql_delete_notice_entries = "DELETE FROM notice;"
        tables.append(sql_delete_notice_entries)
    elif database_type == "summary":
        sql_delete_dns_top_k_entries = "DELETE FROM dns_top_k;"
        tables.append(sql_delete_dns_top_k_entries)
        sql_delete_ip_bytes_sum_entries = "DELETE FROM ip_bytes_sum;"
        tables.append(sql_delete_ip_bytes_sum_entries)
        sql_delete_connection_sum_entries = "DELETE FROM connection_sum;"
        tables.append(sql_delete_connection_sum_entries)
        sql_delete_resp_port_top_k_entries = "DELETE FROM resp_port_top_k;"
        tables.append(sql_delete_resp_port_top_k_entries)
        sql_delete_resp_host_top_k_entries = "DELETE FROM resp_host_top_k;"
        tables.append(sql_delete_resp_host_top_k_entries)
        sql_delete_origin_host_top_k_table = "DELETE FROM origin_host_top_k;"
        tables.append(sql_delete_origin_host_top_k_table)
        sql_delete_proto_sum_entries = "DELETE FROM proto_sum;"
        tables.append(sql_delete_proto_sum_entries)
        sql_delete_service_sum_entries = "DELETE FROM service_sum ;"
        tables.append(sql_delete_service_sum_entries)
        sql_delete_resp_poi_sum_entries = "DELETE FROM resp_poi_sum;"
        tables.append(sql_delete_resp_poi_sum_entries)

    else:
        raise PythiaDatabaseError('Databasetype is unknown')

    # create a database connection
    conn = create_connection(database_path)

    # delete tableentries
    if conn is not None:
        # create detail data table
        delete_table_entries(conn, tables)
        conn.commit()
        # rebuilds the database to save storage
        conn.execute("VACUUM")
        conn.close()
    else:
        raise PythiaDatabaseError(
            'Could not create connection to %s' % (database_path))


''' 
creates databases
database_path: path to databases
database_type: type of database
returns .
'''


def create_database_by_type(database_path, database_type):
    tables = []
    if database_type == "detail":

        sql_create_conn_table = '''CREATE TABLE IF NOT EXISTS conn (
                                            'ts' double precision,
                                            uid TEXT, 
                                            "id.orig_h" TEXT, 
                                            "id.orig_p" INTEGER, 
                                            "id.resp_h" TEXT, 
                                            "id.resp_p" INTEGER, 
                                            proto TEXT, 
                                            service TEXT, 
                                            duration double precision, 
                                            orig_ip_bytes BIGINT, 
                                            resp_ip_bytes BIGINT 
                                    );'''

        tables.append(sql_create_conn_table)
        sql_create_dns_table = ''' CREATE TABLE IF NOT EXISTS dns (
                                            uid TEXT, 
                                            "query" TEXT, 
                                            answers TEXT, 
                                            qtype_name TEXT, 
                                            rcode_name TEXT, 
                                            FOREIGN KEY(uid) REFERENCES conn (uid) ON DELETE CASCADE
                                        ); '''
        tables.append(sql_create_dns_table)

        sql_create_notice_table = '''CREATE TABLE IF NOT EXISTS notice (
                                    'ts' double precision,
                                    'uid' TEXT,
                                    'note' TEXT,
                                    'msg' TEXT,
                                    FOREIGN KEY(uid) REFERENCES conn (uid) ON DELETE CASCADE
                                    );'''
        tables.append(sql_create_notice_table)
    elif database_type == "summary":
        sql_create_dns_top_k_table = '''CREATE TABLE IF NOT EXISTS dns_top_k (
                                    'ts' double precision,
                                    'name' TEXT,
                                    'counter' INTEGER
                                    );'''
        tables.append(sql_create_dns_top_k_table)
        sql_create_ip_bytes_sum_table = '''CREATE TABLE IF NOT EXISTS ip_bytes_sum (
                                        'ts' double precision,
                                        'name' TEXT,
                                        'counter' INTEGER
                                    );'''
        tables.append(sql_create_ip_bytes_sum_table)
        sql_create_connection_sum_table = '''CREATE TABLE IF NOT EXISTS connection_sum (
                                        'ts' double precision,
                                        'counter' INTEGER
                                    );'''
        tables.append(sql_create_connection_sum_table)
        sql_create_resp_port_top_k_table = '''CREATE TABLE IF NOT EXISTS resp_port_top_k (
                                            'ts' double precision,
                                            'resp_p' INTEGER,
                                            'proto' TEXT,
                                            'counter' INTEGER
                                    );'''
        tables.append(sql_create_resp_port_top_k_table)

        sql_create_resp_host_top_k_table = '''CREATE TABLE IF NOT EXISTS resp_host_top_k (
                                            'ts' double precision,
                                            'name' TEXT,
                                            'counter' INTEGER
                                    );'''
        tables.append(sql_create_resp_host_top_k_table)

        sql_create_origin_host_top_k_table = '''CREATE TABLE IF NOT EXISTS origin_host_top_k (
                                            'ts' double precision,
                                            'name' TEXT,
                                            'counter' INTEGER
                                    );'''
        tables.append(sql_create_origin_host_top_k_table)

        sql_create_proto_sum_table = '''CREATE TABLE IF NOT EXISTS proto_sum (
                                            'ts' double precision,
                                            'name' TEXT,
                                            'counter' INTEGER
                                    );'''
        tables.append(sql_create_proto_sum_table)

        sql_create_service_sum_table = '''CREATE TABLE IF NOT EXISTS service_sum (
                                            'ts' double precision,
                                            'name' TEXT,
                                            'counter' INTEGER
                                    );'''
        tables.append(sql_create_service_sum_table)

        sql_create_resp_poi_sum_table = '''CREATE TABLE IF NOT EXISTS resp_poi_sum (
                                        'ts' double precision,
                                        'proto' TEXT,
                                        'resp_p' INTEGER,
                                        'counter' INTEGER
                                    );'''
        tables.append(sql_create_resp_poi_sum_table)

    else:
        raise PythiaDatabaseError('Databasetype is unknown')

    # create a database connection
    conn = create_connection(database_path)

    # create tables
    if conn is not None:
        # create detail data table
        create_tables(conn, tables)
        set_pragma_foreign_keys(conn)
        conn.commit()
        conn.close()

    else:
        raise PythiaDatabaseError(
            'Could not create connection to %s' % (database_path))
