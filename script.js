fetch('equipos.json')
    .then(response => response.json())
    .then(data => {
        const teams = data;
        let firstTeamSelected = false;
        let firstTeamOverall = null;
        let team1 = null;

        // Limpiar filtros
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            const checkboxes = document.querySelectorAll('#leagueFilters input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = false);
            showSelectedFilters(); // Actualizar los filtros seleccionados
        });

        // Mostrar filtros seleccionados
        function showSelectedFilters() {
            const selectedFiltersContainer = document.getElementById('selectedFilters');
            const checkboxes = document.querySelectorAll('#leagueFilters input[type="checkbox"]:checked');
            const selectedFilters = Array.from(checkboxes).map(checkbox => checkbox.value);
            selectedFiltersContainer.innerHTML = selectedFilters.length > 0 ? 'Filtros: ' + selectedFilters.join(', ') : '';
        }

        document.querySelectorAll('#leagueFilters input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', showSelectedFilters);
        });

        // Sorteo de equipos
        document.getElementById('nextTeamBtn').addEventListener('click', () => {
            const selectedLeagues = getSelectedLeagues();
            const overallRange = getOverallRange();
            const filteredTeams = filterTeamsByLeagueAndOverall(teams, selectedLeagues, overallRange);

            if (!firstTeamSelected) {
                startRoulette(filteredTeams, 'team1', (selectedTeam) => {
                    team1 = selectedTeam;
                    firstTeamOverall = team1.Overall; // Guardar el Overall del primer equipo
                    firstTeamSelected = true;
                });
            } else {
                // Filtrar equipos que cumplen con la condición de +/-2 en Overall
                let filteredByOverall = getTeamsWithinOverallRange(filteredTeams, firstTeamOverall);

                if (filteredByOverall.length > 0) { // Solo continuar si hay equipos que cumplen con la diferencia de Overall
                    startRoulette(filteredByOverall, 'team2', (selectedTeam) => {
                        displayTeamData(selectedTeam, 'team2'); // Mostrar el equipo final
                        firstTeamSelected = false; // Reiniciar para la próxima selección
                    });
                } else {
                    alert('No se encontró un equipo dentro del rango de ±2 en Overall.');
                }
            }
        });
        // Función para filtrar equipos que estén dentro del rango de +/- 2
        function getTeamsWithinOverallRange(teams, referenceOverall) {
            const acceptableRange = 2;

            // Filtrar los equipos que están dentro del rango de +/- 2 en Overall
            return teams.filter(team => Math.abs(team.Overall - referenceOverall) <= acceptableRange);
        }

        // Rango de overall
        document.getElementById('minOverall').addEventListener('input', function () {
            const minOverall = parseInt(this.value);
            const maxOverall = parseInt(document.getElementById('maxOverall').value);

            if (minOverall > maxOverall) {
                document.getElementById('maxOverall').value = minOverall;
                document.getElementById('maxOverallValue').innerText = minOverall;
            }
        });

        document.getElementById('maxOverall').addEventListener('input', function () {
            const maxOverall = parseInt(this.value);
            const minOverall = parseInt(document.getElementById('minOverall').value);

            if (maxOverall < minOverall) {
                document.getElementById('minOverall').value = maxOverall;
                document.getElementById('minOverallValue').innerText = maxOverall;
            }
        });

        // Seleccionar ligas grandes
        document.getElementById('selectBigLeaguesBtn').addEventListener('click', () => {
            const bigLeagues = ["Premier League", "La Liga", "Bundesliga", "Serie A", "Ligue 1"];
            const checkboxes = document.querySelectorAll('#leagueFilters input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                if (bigLeagues.includes(checkbox.value)) checkbox.checked = true;
            });
            showSelectedFilters(); // Actualizar los filtros seleccionados
        });

        // Mostrar el equipo seleccionado en la ruleta
        function startRoulette(teams, teamId, callback) {
            let index = 0;
            const intervalTime = 100;
            const spinDuration = 1000;
            const interval = setInterval(() => {
                const currentTeam = teams[index % teams.length];
                displayTeamData(currentTeam, teamId);
                index++;
            }, intervalTime);

            setTimeout(() => {
                clearInterval(interval);
                const selectedTeam = teams[Math.floor(Math.random() * teams.length)];
                callback(selectedTeam);
                displayTeamData(selectedTeam, teamId);
            }, spinDuration);
        }

        // Obtener los valores del rango de overall
        function getOverallRange() {
            const minOverall = document.getElementById('minOverall').value;
            const maxOverall = document.getElementById('maxOverall').value;
            return { minOverall, maxOverall };
        }

        // Obtener ligas seleccionadas
        function getSelectedLeagues() {
            const checkboxes = document.querySelectorAll('#leagueFilters input[type="checkbox"]:checked');
            return Array.from(checkboxes).map(checkbox => checkbox.value);
        }

        // Filtrar equipos por liga y overall
        function filterTeamsByLeagueAndOverall(teams, selectedLeagues, overallRange) {
            let filteredTeams = teams;

            // Filtrar por ligas
            if (selectedLeagues.length > 0) {
                filteredTeams = filteredTeams.filter(team => selectedLeagues.includes(team.Liga.trim()));
            }

            // Filtrar por rango de overall
            filteredTeams = filteredTeams.filter(team => team.Overall >= overallRange.minOverall && team.Overall <= overallRange.maxOverall);

            return filteredTeams;
        }

        // Seleccionar un equipo que tenga una diferencia de +/-2 en el Overall con respecto al equipo 1
        function getRandomTeamWithinRange(teams, referenceOverall) {
            const acceptableRange = 2;

            // Filtrar los equipos que están dentro del rango de +/- 2 en Overall
            const filteredTeams = teams.filter(team => Math.abs(team.Overall - referenceOverall) <= acceptableRange);

            // Asegurarse de que solo se seleccionen equipos dentro del rango permitido
            if (filteredTeams.length > 0) {
                return filteredTeams[Math.floor(Math.random() * filteredTeams.length)];
            }

            // Si no hay equipos dentro del rango, devolver null
            return null;
        }

        // Mostrar los datos del equipo en el HTML
        function displayTeamData(team, teamId) {
            // Mostrar datos del equipo
            document.getElementById(`${teamId}-name`).textContent = team.Equipo || "No disponible";
            document.getElementById(`${teamId}-overall`).textContent = team.Overall || "No disponible";
            document.getElementById(`${teamId}-attack`).textContent = team.Ataque || "No disponible";
            document.getElementById(`${teamId}-midfield`).textContent = team.Mediocampo || "No disponible";
            document.getElementById(`${teamId}-defence`).textContent = team.Defensa || "No disponible";
            document.getElementById(`${teamId}-league`).textContent = team.Liga || "No disponible";
            document.getElementById(`${teamId}-nationality`).textContent = team.País || "No disponible";

            // Mostrar logo del equipo
            document.getElementById(`${teamId}-logo`).src = team.Logo || "default_logo.png";
            document.getElementById(`${teamId}-logo`).alt = `Logo de ${team.Equipo}`;

            // Mostrar bandera del país
            document.getElementById(`${teamId}-flag`).src = team.Bandera || "default_flag.png";
            document.getElementById(`${teamId}-flag`).alt = `Bandera de ${team.País}`;
        }
    })
    .catch(error => console.error('Error al cargar los equipos:', error));
