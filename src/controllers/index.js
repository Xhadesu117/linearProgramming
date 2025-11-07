const solver = require('javascript-lp-solver');

const controller = {};

controller.render  = (req, res) => {
    res.render('index')
}

controller.post = (req, res) => {

    const model = req.body;
    console.log('Modelo recibido en el controlador:', model);
    
    try {
        // Resuelve el modelo
        const results = solver.Solve(model);
        
        // Devuelve los resultados al frontend
        res.json(results);

    } catch (error) {
        console.error("Error en el solver:", error);
        res.status(500).json({ error: "Error al resolver el modelo." });
    }
};

module.exports = controller;