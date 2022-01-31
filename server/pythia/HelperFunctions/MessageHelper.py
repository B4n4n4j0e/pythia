import json

''' 
This function creates a json success message
returns json object.
'''


def success_message():
    return json.dumps({'success': True}), 200, {'ContentType': 'application/json'}
