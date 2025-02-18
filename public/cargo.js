document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.getElementById('searchButton');
    const cargoSearch = document.getElementById('cargoSearch');
    const tbody = document.querySelector('tbody');

    // Fetch all cargos initially
    const fetchAllCargos = async () => {
        try {
            const response = await fetch('/api/cargo');
            if (!response.ok) throw new Error('Error fetching cargos');
            const cargos = await response.json();
            renderCargos(cargos);
        } catch (err) {
            console.error(err.message);
        }
    };

    // Render cargos in the table
    const renderCargos = (cargos) => {
        tbody.innerHTML = '';
        if (cargos.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7">No cargos found</td></tr>';
            return;
        }
        cargos.forEach(cargo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cargo.cargoId}</td>
                <td>${cargo.content}</td>
                <td>${cargo.size || 'N/A'}</td>
                <td>${cargo.storageCondition || 'N/A'}</td>
                <td>${cargo.currentLocation}</td>
                <td>${cargo.customsStatus}</td>
                <td>${new Date(cargo.updatedAt).toLocaleString()}</td>
                <td>${cargo.movementHistory.map(hist => hist.location).join(' -> ') || 'No history'}</td>
            `;
            tbody.appendChild(tr);
        });
    };

    // Search cargos
    searchButton.addEventListener('click', async () => {
        const query = cargoSearch.value.trim();
        if (!query) {
            fetchAllCargos();
            return;
        }
        try {
            const response = await fetch(`/api/cargo/search?cargoId=${query}&content=${query}`);
            if (!response.ok) throw new Error('Error searching cargos');
            const cargos = await response.json();
            renderCargos(cargos);
        } catch (err) {
            console.error(err.message);
        }
    });

    // Initial fetch
    fetchAllCargos();

    document.getElementById('updateButton').addEventListener('click', async () => {
        const cargoId = document.getElementById('updateCargoId').value;
        const newLocation = document.getElementById('newLocation').value;

        if (!cargoId || !newLocation) {
            alert('Please fill out both fields.');
            return;
        }

        try {
            const response = await fetch(`/api/cargo/location`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cargoId, newLocation }),
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Location updated successfully for Cargo ID: ${cargoId}`);
                window.location.reload();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (err) {
            alert('An unexpected error occurred. Please try again.');
        }
    });

    document.getElementById('updateCustomsStatusButton').addEventListener('click', async () => {
        const cargoId = document.getElementById('updateCargoIdCustoms').value;
        const newCustomsStatus = document.getElementById('newCustomsStatus').value;
      
        if (!cargoId || !newCustomsStatus) {
          alert('Please fill out both fields.');
          return;
        }
      
        try {
          const response = await fetch(`/api/cargo/customs-status`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cargoId, customsStatus: newCustomsStatus }),
          });
      
          const result = await response.json();
      
          if (response.ok) {
            alert(`Customs status updated successfully for Cargo ID: ${cargoId}`);
            window.location.reload();
          } else {
            alert(`Error: ${result.error}`);
        }
      } catch (err) {
        alert('An unexpected error occurred. Please try again.');
      }
    });
          
});