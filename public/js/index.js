var term = new Terminal();
var fitAddon = new FitAddon();
var socket = io();
term.loadAddon(fitAddon);
term.open(document.getElementById('terminal'));
fitAddon.fit();
term.write('')
term.onData( (d) => {
    socket.emit('data', d);
});
socket.on('data', d => term.write(d));