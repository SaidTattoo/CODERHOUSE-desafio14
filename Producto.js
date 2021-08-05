let productos = require('./productos')
class Producto {
    constructor(){

    }
    guardar(producto){
        producto.id = productos.length +1
        productos.push(producto)
        return productos
    }
    listar(){
        return productos
    }
    buscarPorId(id){
        return productos.find((producto) =>  producto.id === id)
    }
    eliminar(id){
        let eliminado = productos.find((producto) =>  producto.id === id)
        productos = productos.filter((producto) => producto.id !== id )
        return eliminado
    }
    editar(id, producto){
        let editado = productos[id - 1] = {
            "title": producto.title,
            "price": producto.price,
            "thumbnail":producto.thumbnail
        }
        return editado
    }
}
module.exports = Producto;