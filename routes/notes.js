const express = require("express");
const router = express.Router();
const fecthuser = require("../middleware/fetchuser");
const Note = require("../models/Note");
const { body, validationResult } = require("express-validator");

//ROUTE 1:  Get all the notes using : GET "/api/notes/fetchallnotes".require login

router.get("/fetchallnotes", fecthuser, async (req, res) => {
  try {
    // finding notes for the specified user
    const notes = await Note.find({ user: req.user.id });
    res.json(notes);
  } 
  // if the user is not verified then the below error will occoured
  catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong. Please try again");
  }
});

//ROUTE 2:  Add new notes using : POST "/api/notes/addnote".require login

router.post(
  "/addnote",
  fecthuser,
  [
    // validate the title and description fields
    body("title", "Enter a vaild title").isLength({ min: 3 }),
    body("description", "Enter a vaild description").isLength({ min: 5 }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag } = req.body;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Note({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const saveNote = await note.save();
      res.json(saveNote);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Something went wrong. Please try again");
    }
  }
);

//ROUTE 3:  Update an existing note using : PUT "/api/notes/updatenote".require login

router.put("/updatenote/:id", fecthuser, async (req, res) => {
  const { title, description, tag } = req.body;
  // Create a new note object

  const newNote = {};
  if (title) {
    newNote.title = title;
  }
  if (description) {
    newNote.description = description;
  }
  if (tag) {
    newNote.tag = tag;
  }

  // find the note to be updated and update it
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not authorized");
    }
    note = await Note.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong. Please try again");
  }
});

//ROUTE 4:  Delete an existing note using : DELETE "/api/notes/deletenote".require login

router.delete("/deletenote/:id", fecthuser, async (req, res) => {

  // find the note to be deleted and delete it
  try {
    let note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not found");
    }
    //   Allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not authorized");
    }
    note = await Note.findByIdAndDelete(req.params.id);
    res.json({"Success": "note successfully deleted",note: note});
  } catch (error) {
    console.log(error.message);
    res.status(500).send("Something went wrong. Please try again");
  }
});

module.exports = router;
