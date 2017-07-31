var net = require('net');
var protobuf = require("protobufjs");
var jsonDescriptor = require("./bundle.json"); // exemplary for node
var root = protobuf.Root.fromJSON(jsonDescriptor);
var Msg1 = root.lookupType("msg.Msg1");
var Msg2 = root.lookupType("msg.Msg2");



var HOST = '127.0.0.1';
var PORT = 6969;

// 创建一个TCP服务器实例，调用listen函数开始监听指定端口
// 传入net.createServer()的回调函数将作为”connection“事件的处理函数
// 在每一个“connection”事件中，该回调函数接收到的socket对象是唯一的
net.createServer(function(sock) {

  // 我们获得一个连接 - 该连接自动关联一个socket对象
  console.log('CONNECTED: ' +
    sock.remoteAddress + ':' + sock.remotePort);

  // 为这个socket实例添加一个"data"事件处理函数
  sock.on('data', function(data) {
    // console.log('DATA ' + sock.remoteAddress + ': ' + data);
    // 解析数据
    if (data.length > 3) {
      var type = data[0];
      var buffer = data.slice(1, data.length - 3); //丢弃头尾
      console.log("type : " + type + '   buffer : ');
      console.log(buffer);
      if (type == 0x01) {
        var message = Msg1.decode(buffer);
        console.log('message : ');
        console.log(message);
        var object = Msg1.toObject(message, {
          field1: String,
          field2: Number,
          field3: String,
          // see ConversionOptions
        });
        console.log('DATA Msg1 : ' + 'field1 : ' + object['field1'] + ' | field2 : ' + object['field2'] + ' | field3 : ' + object['field3']);
      } else if (type == 0x02) {
        var message = Msg2.decode(buffer);
        var object = Msg2.toObject(message, {
          field4: Number,
          field5: String,
          field6: String,
          // see ConversionOptions
        });
        console.log('DATA Msg2 : ' + 'field4 : ' + object['field4'] + ' | field5 : ' + object['field5'] + ' | field6 : ' + object['field6']);
      }
    }


    // 回发数据
    var payload1 = {
      field1: "test msg1_field1",
      field2: 123321,
      field3: "test msg1_field3"
    };
    var errMsg1 = Msg1.verify(payload1);
    if (errMsg1)
      throw Error(errMsg1);
    var message1 = Msg1.create(payload1);
    var buffer1 = Msg1.encode(message1).finish();
    //拼接head，表示类型，01:Msg1  02:Msg2
    var contentBuf1 = Buffer.concat([Buffer.from([0x01]), buffer1]);
    //拼接结束标志
    contentBuf1 = Buffer.concat([contentBuf1, Buffer.from([0x0D, 0x0A])]);
    sock.write(contentBuf1);


    var payload2 = {
      field4: 567765,
      field5: 'test msg2_field2',
      field6: "test msg2_field3"
    };
    var errMsg2 = Msg2.verify(payload2);
    if (errMsg2)
      throw Error(errMsg2);
    var message2 = Msg2.create(payload2);
    var buffer2 = Msg2.encode(message2).finish();
    //拼接head，表示类型，01:Msg1  02:Msg2
    var contentBuf2 = Buffer.concat([Buffer.from([0x02]), buffer2]);
    //拼接结束标志
    contentBuf2 = Buffer.concat([contentBuf2, Buffer.from([0x0D, 0x0A])]);
    sock.write(contentBuf2);

  });

  // 为这个socket实例添加一个"close"事件处理函数
  sock.on('close', function(data) {
    console.log('CLOSED: ' +
      sock.remoteAddress + ' ' + sock.remotePort);
  });

}).listen(PORT, HOST);

console.log('Server listening on ' + HOST + ':' + PORT);
