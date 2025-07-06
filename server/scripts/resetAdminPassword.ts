import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // --- GANTI DETAIL DI BAWAH INI ---
    const usernameToUpdate = "admin"; // Ganti dengan username yang mau direset
    const newPassword = "adminpassword123"; // Atur password baru yang Anda inginkan
    // ------------------------------------

    console.log(`Mereset password untuk pengguna: ${usernameToUpdate}...`);
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update pengguna di database
    const updatedUser = await prisma.user.update({
        where: {
            username: usernameToUpdate,
        },
        data: {
            password: hashedPassword,
        },
    });

    console.log(`\n[SUCCESS] Password untuk pengguna '${updatedUser.username}' telah berhasil direset.`);
    console.log(`--> Anda sekarang bisa login dengan password: ${newPassword}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });