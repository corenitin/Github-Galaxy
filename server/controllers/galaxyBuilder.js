const LANGUAGE_COLORS = {
  JavaScript:'#f5c842',TypeScript:'#4287f5',Python:'#3bb8a8',
  Go:'#00c4e0',Rust:'#e8763a',Java:'#e84c3d',Ruby:'#cc3366',
  'C++':'#a855f7',C:'#94a3b8',Swift:'#f97316',Kotlin:'#8b5cf6',
  Dart:'#00b4ab',HTML:'#ef4444',CSS:'#3b82f6',Shell:'#22c55e',
  Vue:'#22c55e',PHP:'#8892b0',default:'#4a6fa5',
};

function assignGalaxyPositions(repos) {
  const sorted = [...repos].sort((a,b) => (b.commitCount||0) - (a.commitCount||0));

  // Group by language for solar systems
  const langGroups = {};
  sorted.forEach(repo => {
    const lang = repo.language || 'Other';
    if (!langGroups[lang]) langGroups[lang] = [];
    langGroups[lang].push(repo);
  });

  const planets = [];
  let globalIndex = 0;
  let solarSystemId = 0;

  Object.entries(langGroups).forEach(([lang, repos]) => {
    solarSystemId++;
    repos.forEach((repo) => {
      // Golden angle spiral — keeps planets evenly spread no matter how many there are
      const goldenAngle = 2.399963;
      const orbitAngle = globalIndex * goldenAngle;

      // Orbit radius: grows with sqrt of index — keeps inner system dense, outer sparse
      // Min 120, grows steadily so even 100 repos don't pile up
      const orbitRadius = 120 + Math.sqrt(globalIndex) * 55;

      // Planet size: sqrt scale so big repos don't dwarf everything
      const maxCommits = sorted[0]?.commitCount || 1;
      const commitRatio = Math.sqrt((repo.commitCount || 1) / Math.max(maxCommits, 1));
      const planetSize = 7 + commitRatio * 28; // 7–35px range

      // Orbit speed: inner planets faster
      const orbitSpeed = 0.00025 + (100 / Math.max(orbitRadius, 80)) * 0.004;

      const color = LANGUAGE_COLORS[repo.language] || LANGUAGE_COLORS.default;

      planets.push({
        ...repo,
        orbitRadius,
        orbitAngle,
        orbitSpeed,
        planetSize,
        planetColor: color,
        solarSystemId,
      });

      globalIndex++;
    });
  });

  return planets;
}

function getPlanetType(repo) {
  if (repo.isArchived) return 'archived';
  if (repo.isFork) return 'forked';
  if (repo.hasDeployment || repo.homepage) return 'deployed';
  return 'active';
}

module.exports = { assignGalaxyPositions, getPlanetType, LANGUAGE_COLORS };
