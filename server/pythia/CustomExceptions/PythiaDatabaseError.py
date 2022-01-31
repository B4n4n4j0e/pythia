class PythiaDatabaseError(Exception):

    def __init__(self, message="Could not perform database operation"):
        self.message = message
