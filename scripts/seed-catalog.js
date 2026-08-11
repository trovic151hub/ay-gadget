// One-time helper to populate the catalog with a realistic placeholder
// product/gadget set (names, prices, conditions) so the site isn't empty
// while you swap in your real inventory via the admin panel.
//
// Run with: node scripts/seed-catalog.js
// It will prompt for your existing admin email/password (typed only into
// your own terminal — never sent anywhere but Firebase Auth) and then
// write the items below as products/gadgets, same as if you'd added them
// by hand in /admin. Safe to re-run; it just adds more documents, it
// doesn't check for duplicates.

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import readline from 'node:readline'

const firebaseConfig = {
  apiKey: "AIzaSyALavEworgb8ks3iMPaCgkXCcDBJiC_1mM",
  authDomain: "ay-s-gadget.firebaseapp.com",
  projectId: "ay-s-gadget",
  storageBucket: "ay-s-gadget.firebasestorage.app",
  messagingSenderId: "34300968590",
  appId: "1:34300968590:web:6fc04bbf948601afe593df"
}

function placeholderImage(name, bg = '111827') {
  return `https://placehold.co/600x600/${bg}/ffffff?text=${encodeURIComponent(name)}`
}

const PRODUCTS = [
  { name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', condition: 'New', price: 1850000, description: 'Titanium design, A17 Pro chip, 256GB storage. Sealed in box with full Apple warranty.' },
  { name: 'iPhone 14 Pro 256GB', brand: 'Apple', condition: 'UK-Used', price: 980000, description: 'Imported from the UK, tested and verified. Minor signs of use, fully functional, 90%+ battery health.' },
  { name: 'iPhone 13 128GB', brand: 'Apple', condition: 'UK-Used', price: 620000, description: 'Imported from the UK, tested and verified. Clean screen and body, 88%+ battery health.' },
  { name: 'iPhone 12 64GB', brand: 'Apple', condition: 'Nigeria-Used', price: 380000, description: 'Locally used, inspected by our technicians. Good working condition.' },
  { name: 'Samsung Galaxy S23 Ultra 256GB', brand: 'Samsung', condition: 'New', price: 1450000, description: 'Sealed, full Samsung Nigeria warranty. 200MP camera, S Pen included.' },
  { name: 'Samsung Galaxy A54 128GB', brand: 'Samsung', condition: 'UK-Used', price: 420000, description: 'Imported from the UK, tested and verified. Great mid-range performance.' },
  { name: 'Samsung Galaxy S21 128GB', brand: 'Samsung', condition: 'Nigeria-Used', price: 310000, description: 'Locally used, inspected by our technicians. Solid daily driver.' },
  { name: 'Google Pixel 7 128GB', brand: 'Google', condition: 'UK-Used', price: 480000, description: 'Imported from the UK, tested and verified. Stock Android, excellent camera.' },
  { name: 'Tecno Camon 20', brand: 'Tecno', condition: 'New', price: 185000, description: 'Sealed, brand new with manufacturer warranty. Great value for everyday use.' },
  { name: 'Infinix Zero 30', brand: 'Infinix', condition: 'New', price: 220000, description: 'Sealed, brand new with manufacturer warranty. 108MP camera, fast charging.' },
]

const GADGETS = [
  { name: 'Apple AirPods Pro (2nd Gen)', brand: 'Apple', condition: 'New', price: 185000, description: 'Active noise cancellation, sealed with full warranty.' },
  { name: 'Samsung Galaxy Buds2 Pro', brand: 'Samsung', condition: 'New', price: 95000, description: 'Hi-fi sound, sealed with full warranty.' },
  { name: 'Apple Watch Series 9', brand: 'Apple', condition: 'New', price: 650000, description: 'GPS, 45mm, sealed with full Apple warranty.' },
  { name: 'JBL Flip 6 Bluetooth Speaker', brand: 'JBL', condition: 'New', price: 75000, description: 'Portable waterproof speaker, sealed with full warranty.' },
  { name: 'Anker 20W USB-C Fast Charger', brand: 'Anker', condition: 'New', price: 12000, description: 'Compact fast-charging brick, compatible with iPhone and Android.' },
  { name: 'Baseus 20000mAh Power Bank', brand: 'Baseus', condition: 'New', price: 25000, description: 'High-capacity power bank with fast charging support.' },
  { name: 'Anker Wireless Charging Pad', brand: 'Anker', condition: 'New', price: 18000, description: 'Qi-certified wireless charger, compatible with most phones.' },
  { name: 'Clear Protective Case (iPhone 15)', brand: 'Generic', condition: 'New', price: 8500, description: 'Shockproof clear case, precise cutouts.' },
]

const GAMES = [
  { name: 'PlayStation 5 Console (Slim)', brand: 'Sony', condition: 'New', price: 850000, description: 'Sealed, full manufacturer warranty. Includes DualSense controller.' },
  { name: 'PlayStation 5 Console', brand: 'Sony', condition: 'UK-Used', price: 620000, description: 'Imported from the UK, tested and verified. Includes controller and cables.' },
  { name: 'Xbox Series X', brand: 'Microsoft', condition: 'New', price: 780000, description: 'Sealed, full manufacturer warranty. 1TB storage.' },
  { name: 'Xbox Series S', brand: 'Microsoft', condition: 'Nigeria-Used', price: 320000, description: 'Locally used, inspected by our technicians. Good working condition.' },
  { name: 'Nintendo Switch OLED', brand: 'Nintendo', condition: 'New', price: 450000, description: 'Sealed, full manufacturer warranty. Vibrant OLED screen.' },
  { name: 'FIFA 24 (PS5)', brand: 'EA Sports', condition: 'New', price: 35000, description: 'Sealed physical disc copy.' },
  { name: 'Call of Duty: Modern Warfare III (Xbox)', brand: 'Activision', condition: 'New', price: 38000, description: 'Sealed physical disc copy.' },
  { name: "God of War Ragnarok (PS5)", brand: 'Sony', condition: 'UK-Used', price: 25000, description: 'Imported from the UK, disc tested and verified working.' },
  { name: 'DualSense Wireless Controller', brand: 'Sony', condition: 'New', price: 65000, description: 'Sealed, full manufacturer warranty.' },
  { name: 'Xbox Wireless Controller', brand: 'Microsoft', condition: 'New', price: 58000, description: 'Sealed, full manufacturer warranty.' },
]

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, answer => { rl.close(); resolve(answer) }))
}

// Raw-mode password prompt so the terminal doesn't echo it back in plain text.
const ENTER_CODES = [10, 13]
const CTRL_C_CODE = 3
const BACKSPACE_CODES = [8, 127]

function askHidden(question) {
  return new Promise(resolve => {
    process.stdout.write(question)
    const stdin = process.stdin
    stdin.resume()
    stdin.setRawMode(true)
    let input = ''
    function onData(buf) {
      const code = buf[0]
      if (ENTER_CODES.includes(code)) {
        stdin.setRawMode(false)
        stdin.pause()
        stdin.removeListener('data', onData)
        process.stdout.write('\n')
        resolve(input)
      } else if (code === CTRL_C_CODE) {
        process.exit(1)
      } else if (BACKSPACE_CODES.includes(code)) {
        input = input.slice(0, -1)
      } else {
        input += buf.toString('utf8')
      }
    }
    stdin.on('data', onData)
  })
}

async function seedCollection(db, collectionName, items, bg) {
  console.log(`Adding ${items.length} items to "${collectionName}"...`)
  for (const item of items) {
    await addDoc(collection(db, collectionName), {
      name: item.name,
      brand: item.brand,
      condition: item.condition,
      description: item.description,
      price: item.price,
      images: [placeholderImage(item.name, bg)],
      createdAt: serverTimestamp()
    })
    console.log(`  + ${item.name} (${item.condition}) - N${item.price.toLocaleString()}`)
  }
}

async function main() {
  const app = initializeApp(firebaseConfig)
  const auth = getAuth(app)
  const db = getFirestore(app)

  const email = await ask('Admin email: ')
  const password = await askHidden('Admin password: ')

  console.log('Signing in...')
  await signInWithEmailAndPassword(auth, email, password)

  await seedCollection(db, 'products', PRODUCTS, '111827')
  await seedCollection(db, 'gadgets', GADGETS, '1e293b')
  await seedCollection(db, 'games', GAMES, '7c2d12')

  console.log('Done. Review and edit these in /admin -- they are placeholders, not real inventory.')
  process.exit(0)
}

main().catch(err => {
  console.error('Seeding failed:', err.message)
  process.exit(1)
})
