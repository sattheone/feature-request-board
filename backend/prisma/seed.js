const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'admin',
    },
  });

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      role: 'user',
    },
  });

  // Create boards
  const boards = await Promise.all([
    prisma.board.create({
      data: {
        name: 'Feature Requests',
        description: 'Suggest new features for the application',
      },
    }),
    prisma.board.create({
      data: {
        name: 'Integrations',
        description: 'Request integrations with other services',
      },
    }),
    prisma.board.create({
      data: {
        name: 'Design Suggestions',
        description: 'Share design ideas and improvements',
      },
    }),
    prisma.board.create({
      data: {
        name: 'UX Improvements',
        description: 'Suggest UX enhancements',
      },
    }),
    prisma.board.create({
      data: {
        name: 'General Feedback',
        description: 'Share general feedback and ideas',
      },
    }),
  ]);

  // Create feature requests for each board
  for (const board of boards) {
    await Promise.all([
      // Open request
      prisma.featureRequest.create({
        data: {
          title: `${board.name} - Open Request`,
          description: 'This is an open request for ' + board.name.toLowerCase(),
          status: 'open',
          category: 'feature',
          boardId: board.id,
          userId: user.id,
        },
      }),
      // Planned request
      prisma.featureRequest.create({
        data: {
          title: `${board.name} - Planned Request`,
          description: 'This is a planned request for ' + board.name.toLowerCase(),
          status: 'planned',
          category: 'feature',
          boardId: board.id,
          userId: user.id,
        },
      }),
      // In Progress request
      prisma.featureRequest.create({
        data: {
          title: `${board.name} - In Progress Request`,
          description: 'This is an in-progress request for ' + board.name.toLowerCase(),
          status: 'in_progress',
          category: 'feature',
          boardId: board.id,
          userId: user.id,
        },
      }),
      // Completed request
      prisma.featureRequest.create({
        data: {
          title: `${board.name} - Completed Request`,
          description: 'This is a completed request for ' + board.name.toLowerCase(),
          status: 'completed',
          category: 'feature',
          boardId: board.id,
          userId: user.id,
        },
      }),
      // Declined request
      prisma.featureRequest.create({
        data: {
          title: `${board.name} - Declined Request`,
          description: 'This is a declined request for ' + board.name.toLowerCase(),
          status: 'declined',
          category: 'feature',
          boardId: board.id,
          userId: user.id,
        },
      }),
    ]);
  }

  console.log('Database has been seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 