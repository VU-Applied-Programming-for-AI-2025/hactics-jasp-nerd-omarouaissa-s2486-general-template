import os
import json

# Get the directory of the current script
script_dir = os.path.dirname(os.path.abspath(__file__))

# Path to the JSON file (now absolute)
file_path = os.path.join(script_dir, 'chat.json')
# Path to the output text file (newly created)
output_file_path = os.path.join(script_dir, 'formatted_chat_log.txt')

def format_chat_log(chat_log):
    formatted_chat_log = ""
    requests = chat_log.get('requests', [])
    for idx, req in enumerate(requests, 1):
        request_message = req.get('message', {}).get('text', '').strip()
        # Some responses may be a list, so join them if needed
        response = req.get('response', [])
        if isinstance(response, list):
            response_message = '\n'.join([str(r) for r in response])
        else:
            response_message = str(response)
        response_message = response_message.strip()
        formatted_chat_log += f"Request {idx}:\nUser: {request_message}\nCopilot: {response_message}\n\n{'-'*30}\n\n"
    return formatted_chat_log

# Reading the JSON file
with open(file_path, 'r') as file:
    chat_log = json.load(file)

# Formatting the chat log
formatted_chat_log = format_chat_log(chat_log)

# Creating and saving the formatted chat log to a new text file
with open(output_file_path, 'w') as file:
    file.write(formatted_chat_log)