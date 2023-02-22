# From: https://stackoverflow.com/questions/59908927/failed-to-load-module-script-the-server-responded-with-a-non-javascript-mime-ty
# Use to create local host
import http.server
import socketserver

PORT = 5050

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({
    ".js": "application/javascript",
});

print("Serving at port", PORT)
httpd = socketserver.TCPServer(("", PORT), Handler)
print(httpd.server_address)
httpd.serve_forever()

# run python file 
# python runServer.py