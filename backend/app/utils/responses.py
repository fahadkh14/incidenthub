from flask import jsonify


def success(data=None, message="Success", status_code=200):
    payload = {"success": True, "message": message, "data": data if data is not None else {}}
    return jsonify(payload), status_code


def error(message="An error occurred", error_code="ERROR", status_code=400):
    payload = {"success": False, "message": message, "error": error_code}
    return jsonify(payload), status_code
