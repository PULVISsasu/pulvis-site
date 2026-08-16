export const establishmentTypes = [
  'Salle de sport indépendante',
  'Salle de sport en réseau / franchise',
  'Studio de coaching ou de discipline sportive',
  'Autre établissement sportif',
] as const

export type EstablishmentType = (typeof establishmentTypes)[number] | string
