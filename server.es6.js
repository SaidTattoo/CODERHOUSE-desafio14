const express = require("express")
const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);


const hbs = require("express-handlebars");
const Producto = require("./Producto.js");
const routerProductos = express.Router();
const PORT = 8080;

let arrayConectados = []
let mensajes = []
//configuracion de handlebars
app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "index.hbs",
    layoutsDir: __dirname + "/views/layouts",
    partialsDir: __dirname + "/views/partials/"
  })
);
app.set("views", "./views");
app.set("view engine", "hbs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));


app.use("/api/productos/", routerProductos);

const prod = new Producto();

routerProductos.get("/listar", (req, res) => {
  const data = prod.listar();
  res.json(
    data.length !== 0
      ? { productos: data }
      : { error: "no hay productos cargados" }
  );
});

app.get("/productos/vista", (req, res) => {
  const data = prod.listar();
  res.render(
    "main",
    data.length !== 0
      ? { productos: data }
      : { error: "no hay productos cargados" }
  );
});
app.get("/", (req, res) => {
  res.render("crearProducto",
    {'products list': prod.listar()}
  );
});

routerProductos.get("/listar/:id", (req, res) => {
  const result = prod.buscarPorId(parseInt(req.params.id));
  res.json(result ? { producto: result } : { error: "producto no encontrado" });
});

routerProductos.post("/guardar/", (req, res) => {
  producto = req.body;
  const guardado = prod.guardar(producto);
  console.log(guardado);
  res.redirect("/productos/vista");
});
routerProductos.put("/actualizar/:id", (req, res) => {
  producto = req.body;
  const result = prod.editar(parseInt(req.params.id), producto);
  res.json(result);
});
routerProductos.delete("/borrar/:id", (req, res) => {
  const result = prod.eliminar(parseInt(req.params.id));
  res.json(result);
});




io.on('connect', socket => {
  io.sockets.emit('productData', { products: prod.listar()})
  io.sockets.emit('crearMensaje',  mensajes)
  socket.on('addNewProduct', data => {
      prod.guardar(data)
      console.log(data);
      io.sockets.emit('productData', { products: prod.listar()})
  });

  socket.on("disconnect",( usuario ) => {
    socket.broadcast.emit('crearMensaje',{usuario: "Admin", mensaje: "un usuario se fue", fecha: new Date()})
  })

  socket.on("entrarChat", (usuario, callback ) => {
    usuario.id = socket.id
    arrayConectados.push(usuario)
    callback(arrayConectados)
  })

  socket.on("crearMensaje", (mensaje , callback) => {
    //socket.broadcast.emit('crearMensaje', mensaje)
    mensajes.push(mensaje)
    io.sockets.emit('crearMensaje',  mensajes)
  })
  socket.on("escribiendo", (data, callback) => {
    socket.broadcast.emit('escribiendo', data)
  })
});


server.listen(PORT, () => {
  console.log(`servidor corriendo en en http://localhost:${PORT}`);
});
server.on("error", (error) => console.log(`error en el servidor ${error}`));
