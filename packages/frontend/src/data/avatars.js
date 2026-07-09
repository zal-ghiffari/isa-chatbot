const AVATARS = [
  { id: 'lion', emoji: '\u{1F981}', bg: '#FF6B6B', label: 'Singa' },
  { id: 'tiger', emoji: '\u{1F42F}', bg: '#4ECDC4', label: 'Harimau' },
  { id: 'cat', emoji: '\u{1F431}', bg: '#FFD93D', label: 'Kucing' },
  { id: 'dog', emoji: '\u{1F436}', bg: '#6C5CE7', label: 'Anjing' },
  { id: 'rabbit', emoji: '\u{1F430}', bg: '#A8E6CF', label: 'Kelinci' },
  { id: 'fox', emoji: '\u{1F98A}', bg: '#FF8A5C', label: 'Rubah' },
  { id: 'panda', emoji: '\u{1F43C}', bg: '#2D3436', label: 'Panda' },
  { id: 'frog', emoji: '\u{1F438}', bg: '#00B894', label: 'Katak' },
  { id: 'unicorn', emoji: '\u{1F984}', bg: '#A29BFE', label: 'Unicorn' },
  { id: 'dragon', emoji: '\u{1F432}', bg: '#E17055', label: 'Naga' },
  { id: 'eagle', emoji: '\u{1F985}', bg: '#0984E3', label: 'Elang' },
  { id: 'octopus', emoji: '\u{1F419}', bg: '#FD79A8', label: 'Gurita' },
]

export function getRandomAvatar() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]
}

export function getAvatarById(id) {
  return AVATARS.find(a => a.id === id) || AVATARS[0]
}

export default AVATARS
