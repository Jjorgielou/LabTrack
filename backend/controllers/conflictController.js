const Model = requie('. . /models/ConflictModel');

exports.reportConflict = async (req, res) => {
    try {
        const result = await Model.createConflict(req.body);
        res.status(201).kson({message:"Conflict reported", id: result.insertId });
    } catch (err) {
        res.status(500).json({error:err.message});
    }
};

exports.getConflicts = async (req, res) => {
    const data = await Model.geAll();
    res.json(data);
};