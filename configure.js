const fs = require('fs');
const readline = require('readline');
const path = require('path');

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promise wrapper for question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

// Configuration template with default values and descriptions
const configTemplate = {
    // Database Configuration
    DB_HOST: {
        default: 'localhost',
        description: 'Database host (localhost or IP address)'
    },
    DB_PORT: {
        default: '3306',
        description: 'Database port'
    },
    DB_USER: {
        default: 'root',
        description: 'Database username'
    },
    DB_PASSWORD: {
        default: '',
        description: 'Database password'
    },
    DB_NAME: {
        default: 'database_development',
        description: 'Database name'
    },
    DB_DIALECT: {
        default: 'mariadb',
        description: 'Database dialect'
    },
    // Application Configuration
    NODE_ENV: {
        default: 'development',
        description: 'Node environment (development/production)'
    },
    PORT: {
        default: '8080',
        description: 'Application port'
    },
    // Email Configuration
    SMTP_HOST: {
        default: 'smtp.example.com',
        description: 'SMTP host'
    },
    SMTP_PORT: {
        default: '587',
        description: 'SMTP port'
    },
    SMTP_USER: {
        default: '',
        description: 'SMTP username'
    },
    SMTP_PASSWORD: {
        default: '',
        description: 'SMTP password'
    },
    // Session Configuration
    SESSION_SECRET: {
        default: Math.random().toString(36).substring(2),
        description: 'Session secret key'
    }
};

function parseEnvFile(filePath) {
    try {
        const envContent = fs.readFileSync(filePath, 'utf8');
        const envVariables = {};
        
        envContent.split('\n').forEach(line => {
            // Skip comments and empty lines
            if (line.startsWith('#') || !line.trim()) return;
            
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                envVariables[key.trim()] = valueParts.join('=').trim();
            }
        });
        
        return envVariables;
    } catch (error) {
        return {};
    }
}

async function generateEnvFile() {
    const envPath = path.join(process.cwd(), '.env');
    const existingEnv = parseEnvFile(envPath);
    const requiredVars = Object.keys(configTemplate);
    
    // Check if all required variables exist in the current .env file
    const missingVars = requiredVars.filter(key => !(key in existingEnv));
    
    if (fs.existsSync(envPath) && missingVars.length === 0) {
        console.log('.env file already exists with all required variables.');
        rl.close();
        return;
    }

    // If .env doesn't exist or has missing variables, generate content
    console.log(fs.existsSync(envPath) 
        ? '\nAdding missing environment variables...'
        : '\nGenerating new .env file...');
    console.log('Press Enter to use the default value (shown in parentheses).\n');

    let envContent = '';
    const sections = {
        'Database Configuration': ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'DB_DIALECT'],
        'Application Configuration': ['NODE_ENV', 'PORT'],
        'Email Configuration': ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD'],
        'Session Secret': ['SESSION_SECRET']
    };

    // Generate content section by section
    for (const [section, variables] of Object.entries(sections)) {
        let sectionHasVariables = false;
        let sectionContent = `# ${section}\n`;
        
        for (const key of variables) {
            // Skip if variable already exists in .env
            if (key in existingEnv) {
                sectionContent += `${key}=${existingEnv[key]}\n`;
                sectionHasVariables = true;
                continue;
            }

            const config = configTemplate[key];
            let value = await question(
                `${key} (${config.description}) [${config.default}]: `
            );
            
            // Use default value if no input provided
            value = value.trim() || config.default;
            sectionContent += `${key}=${value}\n`;
            sectionHasVariables = true;
        }
        
        if (sectionHasVariables) {
            envContent += sectionContent + '\n';
        }
    }

    // Write to .env file
    try {
        fs.writeFileSync(envPath, envContent);
        console.log('\nSuccessfully created/updated .env file!');
        console.log(`File location: ${envPath}`);
    } catch (error) {
        console.error('Error writing .env file:', error);
    }

    rl.close();
}

// Start the script
console.log('Project Configuration');
console.log('=========================');
generateEnvFile();
console.log('=========================');
console.log('Project Configuration');
