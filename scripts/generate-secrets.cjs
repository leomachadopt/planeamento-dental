const crypto = require('crypto')

console.log('\n🔐 Gerando secrets seguros para JWT...\n')

const jwtSecret = crypto.randomBytes(32).toString('hex')
const refreshTokenSecret = crypto.randomBytes(32).toString('hex')

console.log('Cole estes valores no seu arquivo .env:\n')
console.log('JWT_SECRET=' + jwtSecret)
console.log('REFRESH_TOKEN_SECRET=' + refreshTokenSecret)
console.log('\n✅ Secrets gerados com sucesso!')
console.log('\n💡 Dica: Se quiser que tokens locais funcionem em produção,')
console.log('   use os MESMOS valores que estão no Vercel.\n')
