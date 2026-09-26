import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import { DATA_DIR } from './paths'
import { describe, teamSchema } from './schema'

export interface Institution {
  id: string
  name: string
  url?: string
}

export interface Person {
  id: string
  name: string
  url?: string
  institution?: string
  role?: string
  listed?: boolean
  alumni?: boolean
  photo?: string
  aliases?: string[]
}

export interface Team {
  institutions: Institution[]
  people: Person[]
}

export function loadTeam(file = path.join(DATA_DIR, 'team.yaml')): Team {
  const parsed = teamSchema.safeParse(yaml.load(fs.readFileSync(file, 'utf8')))
  if (!parsed.success) throw new Error(`site/data/team.yaml is invalid:\n${describe(parsed.error)}`)
  const team = parsed.data
  const institutions = new Set(team.institutions.map((i) => i.id))
  const ids = new Set<string>()
  for (const person of team.people) {
    if (ids.has(person.id)) throw new Error(`team.yaml: duplicate person id ${person.id}`)
    ids.add(person.id)
    if (person.institution && !institutions.has(person.institution)) {
      throw new Error(`team.yaml: ${person.id} has unknown institution ${person.institution}`)
    }
  }
  return team
}
