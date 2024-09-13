fetch('teams.json')
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
                    firstTeamOverall = team1.overall;
                    firstTeamSelected = true;
                });
            } else {
                let team2;
                do {
                    team2 = getRandomTeamWithinRange(filteredTeams, firstTeamOverall);
                } while (team1 && team2.team_name === team1.team_name);

                startRoulette(filteredTeams, 'team2', () => {
                    displayTeamData(team2, 'team2');
                    firstTeamSelected = false;
                });
            }
        });
        // Validar que el mínimo no sea mayor que el máximo
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
        function getSelectedLeagues() {
            const checkboxes = document.querySelectorAll('#leagueFilters input[type="checkbox"]:checked');
            return Array.from(checkboxes).map(checkbox => checkbox.value);
        }

        function filterTeamsByLeague(teams, selectedLeagues) {
            return selectedLeagues.length === 0 ? teams : teams.filter(team => selectedLeagues.includes(team.league_name.trim()));
        }
        // Filtrar por ligas y overall
        function filterTeamsByLeagueAndOverall(teams, selectedLeagues, overallRange) {
            let filteredTeams = teams;

            // Filtrar por ligas
            if (selectedLeagues.length > 0) {
                filteredTeams = filteredTeams.filter(team => selectedLeagues.includes(team.league_name.trim()));
            }

            // Filtrar por rango de overall
            filteredTeams = filteredTeams.filter(team => team.overall >= overallRange.minOverall && team.overall <= overallRange.maxOverall);

            return filteredTeams;
        }
        function getRandomTeamWithinRange(teams, referenceOverall) {
            const acceptableRange = 2;
            const filteredTeams = teams.filter(team => Math.abs(team.overall - referenceOverall) <= acceptableRange);
            return filteredTeams.length === 0 ? teams[Math.floor(Math.random() * teams.length)] : filteredTeams[Math.floor(Math.random() * filteredTeams.length)];
        }

        function displayTeamData(team, teamId) {
            document.getElementById(`${teamId}-name`).textContent = team.team_name || "No disponible";
            document.getElementById(`${teamId}-overall`).textContent = team.overall || "No disponible";
            document.getElementById(`${teamId}-attack`).textContent = team.attack || "No disponible";
            document.getElementById(`${teamId}-midfield`).textContent = team.midfield || "No disponible";
            document.getElementById(`${teamId}-defence`).textContent = team.defence || "No disponible";
            document.getElementById(`${teamId}-league`).textContent = team.league_name || "No disponible";
            document.getElementById(`${teamId}-nationality`).textContent = team.nationality_name || "No disponible";
        }
    })
    .catch(error => console.error('Error al cargar los equipos:', error));
