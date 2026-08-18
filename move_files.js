const fs = require('fs');
const cats = ['percetakan', 'ritel', 'jasa'];
cats.forEach(cat => {
  try {
    const oldInventoryPath = `src/app/ubos/${cat}/[slug]/inventory/page.tsx`;
    const newInventoryPath = `src/app/ubos/${cat}/[slug]/inventory/new/page.tsx`;
    const dashboardPath = `src/app/ubos/${cat}/[slug]/page.tsx`;
    
    // Create new folder if it doesn't exist
    if (!fs.existsSync(`src/app/ubos/${cat}/[slug]/inventory/new`)) {
      fs.mkdirSync(`src/app/ubos/${cat}/[slug]/inventory/new`, { recursive: true });
    }
    
    // Move the file
    if (fs.existsSync(oldInventoryPath)) {
      fs.renameSync(oldInventoryPath, newInventoryPath);
      console.log(`Moved inventory for ${cat}`);
    }
    
    // Delete the dashboard file
    if (fs.existsSync(dashboardPath)) {
      fs.unlinkSync(dashboardPath);
      console.log(`Deleted dashboard for ${cat}`);
    }
  } catch(e) {
    console.error(e);
  }
});
