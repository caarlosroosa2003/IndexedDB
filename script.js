    const addNoteBtn = document.getElementById('addNoteBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const notesContainer = document.getElementById('notesContainer');

    // Abrir la base de datos
    const openDB = indexedDB.open('NotasDB', 1);

    openDB.onupgradeneeded = function (e) {
      const db = e.target.result;

      // Crear un almacén de objetos para las notas
      if (!db.objectStoreNames.contains('notas')) {
        db.createObjectStore('notas', { keyPath: 'id', autoIncrement: true });
      }
    };

    openDB.onsuccess = function (e) {
      const db = e.target.result;

      // Cargar notas almacenadas al cargar la página
      loadNotes();

      addNoteBtn.addEventListener('click', function () {
        const noteText = prompt('Ingrese el contenido de la nota:');
        if (noteText) {
          addNoteToDB(db, noteText);
        }
      });

      deleteAllBtn.addEventListener('click', function () {
        if (confirm('¿Está seguro de que desea eliminar todas las notas?')) {
          deleteAllNotesFromDB(db);
        }
      });
    };

    function addNoteToDB(db, text) {
      const transaction = db.transaction(['notas'], 'readwrite');
      const store = transaction.objectStore('notas');

      const note = {
        text: text,
        timestamp: new Date().getTime()
      };

      const request = store.add(note);

      request.onsuccess = function () {
        loadNotes();
      };

      transaction.oncomplete = function () {
        console.log('Nota agregada exitosamente.');
      };

      transaction.onerror = function () {
        console.error('Error al agregar la nota.');
      };
    }

    function deleteNoteFromDB(db, id) {
      const transaction = db.transaction(['notas'], 'readwrite');
      const store = transaction.objectStore('notas');

      const request = store.delete(id);

      request.onsuccess = function () {
        loadNotes();
      };

      transaction.oncomplete = function () {
        console.log('Nota eliminada exitosamente.');
      };

      transaction.onerror = function () {
        console.error('Error al eliminar la nota.');
      };
    }

    function deleteAllNotesFromDB(db) {
      const transaction = db.transaction(['notas'], 'readwrite');
      const store = transaction.objectStore('notas');

      const request = store.clear();

      request.onsuccess = function () {
        loadNotes();
      };

      transaction.oncomplete = function () {
        console.log('Todas las notas han sido eliminadas.');
      };

      transaction.onerror = function () {
        console.error('Error al eliminar todas las notas.');
      };
    }

    function loadNotes() {
      while (notesContainer.firstChild) {
        notesContainer.removeChild(notesContainer.firstChild);
      }

      const transaction = openDB.result.transaction(['notas'], 'readonly');
      const store = transaction.objectStore('notas');

      const request = store.openCursor();

      request.onsuccess = function (e) {
        const cursor = e.target.result;

        if (cursor) {
          const note = cursor.value;
          createNoteElement(note);
          cursor.continue();
        }
      };
    }

    function createNoteElement(note) {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note', 'shadow');
  
        const deleteNoteBtn = document.createElement('button');
        deleteNoteBtn.classList.add('btn', 'btn-danger', 'delete-note-btn');
        deleteNoteBtn.setAttribute('data-note-id', note.id);
        deleteNoteBtn.innerHTML = 'Eliminar Nota';
  
        noteElement.innerHTML = `
          <p>${note.text}</p>
          <small>${new Date(note.timestamp).toLocaleString()}</small>
        `;
        
        noteElement.appendChild(deleteNoteBtn);
        notesContainer.appendChild(noteElement);
  
        deleteNoteBtn.addEventListener('click', function () {
          const noteId = parseInt(deleteNoteBtn.getAttribute('data-note-id'));
          deleteNoteFromDB(openDB.result, noteId);
        });
      }