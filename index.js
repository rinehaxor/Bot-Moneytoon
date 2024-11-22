const axios = require('axios');
const readline = require('readline');

// Fungsi untuk mendapatkan daftar task
async function getTasks(accessToken) {
   try {
      const url = 'https://mt.promptale.io/tasks';
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         Accept: 'application/json',
      };
      const response = await axios.get(url, { headers });
      if (response.data.success) {
         const tasks = response.data.data;
         console.log('Daftar TaskIdx:');
         tasks.forEach((task) => {
            console.log(`TaskIdx: ${task.taskIdx}`);
         });
         return tasks.map((task) => task.taskIdx);
      } else {
         console.error('Gagal mendapatkan daftar task:', response.data.message);
         return [];
      }
   } catch (error) {
      console.error('Terjadi kesalahan saat mendapatkan daftar task:', error.message);
      return [];
   }
}

// Fungsi untuk menyelesaikan task
async function completeTask(accessToken, taskIdx) {
   try {
      const url = 'https://mt.promptale.io/tasks/taskRun';
      const payload = { taskIdx };
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         'Content-Type': 'application/json',
      };
      const response = await axios.post(url, payload, { headers });
      if (response.data.success) {
         console.log(`Task ${taskIdx} berhasil diselesaikan.`);
         return true;
      } else {
         console.error(`Gagal menyelesaikan task ${taskIdx}:`, response.data.message);
         return false;
      }
   } catch (error) {
      console.error(`Terjadi kesalahan saat menyelesaikan task ${taskIdx}:`, error.message);
      return false;
   }
}

// Fungsi untuk klaim task setelah selesai
async function claimTask(accessToken, taskIdx) {
   try {
      const url = 'https://mt.promptale.io/tasks/taskComplete';
      const payload = { taskIdx };
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         'Content-Type': 'application/json',
      };
      const response = await axios.post(url, payload, { headers });
      if (response.data.success) {
         const { point, egg, boostPoint, apyPoint } = response.data.data;
         console.log(`Task ${taskIdx} berhasil diklaim. Point: ${point}, Egg: ${egg}, BoostPoint: ${boostPoint}, APY Point: ${apyPoint}`);
      } else {
         console.error(`Gagal klaim task ${taskIdx}:`, response.data.message);
      }
   } catch (error) {
      console.error(`Terjadi kesalahan saat klaim task ${taskIdx}:`, error.message);
   }
}

// Fungsi untuk mendapatkan informasi point, egg, dan slPassClaimCount
async function getPointsInfo(accessToken) {
   try {
      const url = 'https://mt.promptale.io/main/mypoint';
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         Accept: 'application/json',
      };
      const response = await axios.get(url, { headers });
      if (response.data.success) {
         const { point, egg, slPassClaimCount } = response.data.data;
         console.log(`Informasi Terbaru:`);
         console.log(`Point: ${point}`);
         console.log(`Egg: ${egg}`);
         console.log(`SL Pass Claim Count: ${slPassClaimCount}`);
         return { egg }; // Mengembalikan jumlah egg
      } else {
         console.error('Gagal mendapatkan informasi point:', response.data.message);
         return { egg: 0 };
      }
   } catch (error) {
      console.error('Terjadi kesalahan saat mendapatkan informasi point:', error.message);
      return { egg: 0 };
   }
}

// Fungsi untuk membuka telur (egg)
async function openEgg(accessToken) {
   try {
      const url = 'https://mt.promptale.io/rewards/myEggOpen';
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         'Content-Type': 'application/json',
      };
      const response = await axios.post(url, {}, { headers });
      if (response.data.success) {
         const { getPoint } = response.data.data;
         console.log(`Egg dibuka! Anda mendapatkan Point: ${getPoint}`);
         return true;
      } else {
         console.error('Gagal membuka egg:', response.data.message);
         return false;
      }
   } catch (error) {
      console.error('Terjadi kesalahan saat membuka egg:', error.message);
      return false;
   }
}
async function getGameStatus(accessToken, gameId) {
   try {
      const url = `https://mt.promptale.io/games/status?gameCode=${gameId}`;
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         Accept: 'application/json',
      };
      const response = await axios.get(url, { headers });

      if (Array.isArray(response.data.data)) {
         console.log(`==========================`);
         console.log(`Status Game ${gameId}:`);
         response.data.data.forEach((game) => {
            console.log(`Level: ${game.level}, Daily Times: ${game.dailyTimes} Times, Total Times: ${game.times} Times`);
         });
         console.log(`==========================`);
         return response.data.data; // Mengembalikan data level game
      } else {
         console.error(`Data dari API untuk game ${gameId} tidak berupa array.`);
         return [];
      }
   } catch (error) {
      console.error(`Terjadi kesalahan saat mendapatkan status game ${gameId}:`, error.message);
      return [];
   }
}

// Fungsi untuk menjalankan dan menyelesaikan game
async function runAndCompleteGame(accessToken, gameId, level) {
   try {
      // Step 1: Jalankan game dengan gameRun
      const runUrl = 'https://mt.promptale.io/games/gameRun';
      const headers = {
         Authorization: `Bearer ${accessToken}`,
         'Content-Type': 'application/json',
         Accept: 'application/json',
      };
      const runPayload = {
         gameId: gameId,
         level: level,
         logStatus: 'S',
      };

      const runResponse = await axios.post(runUrl, runPayload, { headers });

      if (runResponse.status === 201) {
         const runIdx = runResponse.data.data; // Ambil Data ID dari respons gameRun
         console.log(`Game Started: RunIdx: ${runIdx}`);

         // Step 2: Selesaikan game dengan gameComplete
         const completeUrl = 'https://mt.promptale.io/games/gameComplete';
         const completePayload = {
            gameId: gameId,
            level: level,
            runIdx: runIdx, // Gunakan Data ID dari respons gameRun
         };

         const completeResponse = await axios.post(completeUrl, completePayload, { headers });

         if (completeResponse.status === 201) {
            const { point, egg, boostPoint, apyPoint } = completeResponse.data.data;
            console.log('==========================');
            console.log(`Game Completed:`);
            console.log(`Game ID: ${gameId}`);
            console.log(`Level: ${level}`);
            console.log(`RunIdx: ${runIdx}`);
            console.log(`Points Earned: ${point}`);
            console.log(`Eggs Earned: ${egg}`);
            console.log(`Boost Points: ${boostPoint}`);
            console.log(`APY Points: ${apyPoint}`);
            console.log('==========================');
         } else {
            console.error('Failed to complete the game:', completeResponse.data);
         }
      } else {
         console.error('Failed to start the game:', runResponse.data);
      }
   } catch (error) {
      console.error('Terjadi kesalahan saat menjalankan atau menyelesaikan game:', error.message);
   }
}

// Fungsi utama untuk memainkan semua level hingga 6 kali
async function playAllLevels(accessToken, gameIds) {
   const maxPlays = 6;

   for (const gameId of gameIds) {
      console.log(`Memulai pemrosesan untuk game: ${gameId}`);

      // Dapatkan status game untuk setiap gameId
      const gameStatus = await getGameStatus(accessToken, gameId);

      for (const game of gameStatus) {
         const remainingPlays = maxPlays - game.times;
         if (remainingPlays > 0) {
            console.log(`Memainkan level ${game.level} pada game ${gameId} sebanyak ${remainingPlays} kali.`);
            for (let i = 0; i < remainingPlays; i++) {
               await runAndCompleteGame(accessToken, gameId, game.level);
               await delay(1000);
            }
         } else {
            console.log(`Level ${game.level} pada game ${gameId} sudah dimainkan ${maxPlays} kali, melewati.`);
         }
      }
   }

   console.log('Semua game selesai diproses.');
}

const gameIds = ['Mahjong', 'Matching', 'Sliding'];
function delay(ms) {
   return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main function untuk mengatur alur kerja
async function main() {
   const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
   });

   rl.question('Masukkan token Anda: ', async (accessToken) => {
      if (!accessToken) {
         console.error('Token tidak boleh kosong.');
         rl.close();
         return;
      }

      const taskIdxs = await getTasks(accessToken);

      for (const taskIdx of taskIdxs) {
         const completed = await completeTask(accessToken, taskIdx);
         if (completed) {
            await claimTask(accessToken, taskIdx);
            await delay(1000);
         }
      }

      const { egg } = await getPointsInfo(accessToken);

      // Jika egg lebih dari 0, buka egg sebanyak jumlah egg
      if (egg > 0) {
         console.log(`Anda memiliki ${egg} egg. Membuka egg...`);
         for (let i = 0; i < egg; i++) {
            await openEgg(accessToken);
            await delay(100);
         }
      } else {
         console.log('Tidak ada egg untuk dibuka.');
      }
      await getGameStatus(accessToken);
      await playAllLevels(accessToken, gameIds);

      console.log('Semua proses selesai.');
      rl.close();
   });
}

main();
