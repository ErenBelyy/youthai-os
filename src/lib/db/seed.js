// Seed disabled — workspaces, projects, agents must be created by signed-in users.
// We still seed the catalog of agent personas (read-only) on first run.
import { repo } from './client';

let seeded = false;

export async function ensureSeed() {
  if (seeded) return;
  const agentsRepo = repo('agents');
  const existing = await agentsRepo.list();
  if (existing.length === 0) {
    const agents = [
      { workspaceId:'global', key:'grant', name:'Grant Agent', emoji:'\ud83d\udcb8', tagline:'Drafts full grant proposals, budgets, and logframes.', system:'You are a senior NGO grant writer.' },
      { workspaceId:'global', key:'presentation', name:'Presentation Agent', emoji:'\ud83c\udfa8', tagline:'Generates editable slide decks for events and donors.', system:'You are a deck designer.' },
      { workspaceId:'global', key:'research', name:'Research Agent', emoji:'\ud83d\udd0e', tagline:'Synthesizes reports from documents and the web.', system:'You are a research analyst.' },
      { workspaceId:'global', key:'social', name:'Social Media Agent', emoji:'\ud83d\udcf1', tagline:'Crafts campaigns across LinkedIn, IG, X and TikTok.', system:'You are a Gen-Z social strategist.' },
      { workspaceId:'global', key:'opportunity', name:'Opportunity Agent', emoji:'\ud83c\udf1f', tagline:'Personalizes Erasmus+, grants and youth exchanges.', system:'You are an opportunity matcher.' },
    ];
    for (const a of agents) await agentsRepo.create(a);
  }
  // Seed global opportunities catalog (visible to all workspaces)
  const oppsRepo = repo('opportunities');
  const existingOpps = await oppsRepo.list();
  if (existingOpps.length === 0) {
    const opps = [
      { title:'Erasmus+ Training: Digital Storytelling for NGOs', org:'SALTO Youth', country:'Portugal', deadline:'2025-08-20', category:'Training', match:96 },
      { title:'European Youth Foundation Pilot Activity', org:'Council of Europe', country:'Online', deadline:'2025-09-01', category:'Grant', match:91 },
      { title:'EuroPeers Hackathon Civic Tech', org:'EuroPeers', country:'Germany', deadline:'2025-07-30', category:'Hackathon', match:87 },
      { title:'Volunteer with SCI — Climate Action Camp', org:'Service Civil International', country:'Italy', deadline:'2025-07-15', category:'Volunteering', match:82 },
      { title:'Youth Exchange: Bridges Across Borders', org:'JEF Europe', country:'Belgium', deadline:'2025-08-10', category:'Youth Exchange', match:94 },
    ];
    for (const o of opps) await oppsRepo.create({ workspaceId:'global', ...o });
  }
  seeded = true;
}
