console.log('tasks.js loaded');

// Configurar o Amplify quando a página carregar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Configurando Amplify...');
        const { Amplify, Auth } = aws_amplify;
        Amplify.configure(awsConfig);

        // Verificar autenticação
        const user = await Auth.currentAuthenticatedUser();
        console.log('Usuário autenticado:', user);

        // Obter atributos do usuário
        const { phone_number } = user.attributes;
        if (!phone_number) {
            console.log('Usuário não tem número de telefone');
            window.location.href = '/subscription.html';
            return;
        }

        // Formatar número removendo caracteres não numéricos
        const formattedPhone = (phone_number || '').replace(/\D/g, '');
        console.log('Número formatado:', formattedPhone);

        // Verificar instância
        console.log('Verificando instância para o telefone:', formattedPhone);
        const response = await fetch('https://n8n.autonomia.site/webhook/transcricao_site', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageType: 'checkingInstante',
                phoneNumber: formattedPhone
            })
        });

        const data = await response.json();
        console.log('Resposta da verificação de instância:', data);

        if (data.status !== '200' || data.message !== 'active') {
            console.log('Instância não está ativa');
            window.location.href = '/whatsapp-connect.html?hidePayment=true';
            return;
        }

        // Inicializar Kanban
        console.log('Inicializando Kanban...');
        initKanban();

        // Configurar logout
        document.getElementById('logoutButton').addEventListener('click', async () => {
            try {
                await Auth.signOut();
                window.location.href = '/login.html';
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar:', error);
        window.location.href = '/login.html';
    }
});

// Função para inicializar o Kanban
function initKanban() {
    // Carregar tarefas
    loadTasks();

    // Inicializar Sortable para cada lista de tarefas
    document.querySelectorAll('.task-list').forEach(taskList => {
        new Sortable(taskList, {
            group: 'tasks',
            animation: 150,
            onStart: function(evt) {
                evt.item.style.opacity = '0.8';
                evt.item.style.transform = 'scale(1.05)';
            },
            onEnd: async function(evt) {
                evt.item.style.opacity = '';
                evt.item.style.transform = '';
                document.querySelectorAll('.task-list').forEach(list => {
                    list.classList.remove('dragover');
                });
                const taskId = evt.item.dataset.id;
                const newStatus = evt.to.closest('.kanban-column').dataset.status;
                await updateTaskStatus(taskId, newStatus);
            },
            onMove: function(evt) {
                document.querySelectorAll('.task-list').forEach(list => {
                    list.classList.remove('dragover');
                });
                evt.to.classList.add('dragover');
            }
        });
    });
}

// Função para carregar tarefas
async function loadTasks() {
    try {
        console.log('Iniciando carregamento de tarefas...');
        
        const user = await Auth.currentAuthenticatedUser();
        const { phone_number } = user.attributes;
        const formattedPhone = (phone_number || '').replace(/\D/g, '');
        console.log('Telefone formatado:', formattedPhone);

        const requestBody = {
            messageType: 'getTasks',
            phone: formattedPhone
        };
        console.log('Corpo da requisição:', requestBody);

        const response = await fetch('https://n8n.autonomia.site/webhook/todo-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        console.log('Status da resposta:', response.status);
        const responseData = await response.json();
        console.log('Dados recebidos:', responseData);

        if (responseData.data && Array.isArray(responseData.data)) {
            console.log(`Renderizando ${responseData.data.length} tarefas`);
            renderTasks(responseData.data);
        } else {
            console.log('Nenhuma tarefa recebida');
            renderTasks([]);
        }
    } catch (error) {
        console.error('Erro ao carregar tarefas:', error);
    }
}

// Função para renderizar tarefas
function renderTasks(tasks) {
    // Limpar listas de tarefas
    document.querySelectorAll('.task-list').forEach(list => {
        list.innerHTML = '';
    });

    // Renderizar cada tarefa
    tasks.forEach(task => {
        const card = createTaskCard(task);
        const column = document.querySelector(`[data-status="${task.status || 'pending'}"] .task-list`);
        if (column) {
            column.appendChild(card);
        }
    });
}

// Função para criar card de tarefa
function createTaskCard(task) {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.id = task.task_code;
    
    let dueDateText = 'Sem data';
    if (task.due_date) {
        const date = new Date(task.due_date);
        dueDateText = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    const formattedPhone = task.contact_phonenumber ? 
        String(task.contact_phonenumber).replace(/^(\d{2})(\d{2})(\d{4})(\d{4})$/, '($2) $3-$4') :
        '';
    
    card.innerHTML = `
        <div class="task-header">
            <span class="task-code">
                <i class="fas fa-hashtag"></i>
                ${task.task_code || ''}
            </span>
        </div>
        <div class="task-contact">
            <div class="contact-info">
                <span class="contact-name">
                    <i class="fas fa-user"></i>
                    ${task.contact_name || ''}
                </span>
                <span class="contact-phone">
                    <i class="fas fa-phone"></i>
                    ${formattedPhone}
                </span>
            </div>
        </div>
        <div class="task-description">${task.description || ''}</div>
        <a href="#" class="task-due-date" data-date="${task.due_date || ''}">
            <i class="fas fa-calendar"></i>
            Entrega em ${dueDateText}
        </a>
    `;

    // Adicionar event listener para edição
    const dueDateLink = card.querySelector('.task-due-date');
    dueDateLink.addEventListener('click', (e) => {
        e.preventDefault();
        openEditModal(task.task_code);
    });
    
    return card;
}

// Função para atualizar status da tarefa
async function updateTaskStatus(taskId, newStatus) {
    try {
        const user = await Auth.currentAuthenticatedUser();
        const { phone_number } = user.attributes;
        const formattedPhone = phone_number.replace(/^\+/, '').replace(/\D/g, '');

        const response = await fetch('https://n8n.autonomia.site/webhook/todo-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageType: 'updateStatus',
                phone: formattedPhone,
                status: newStatus,
                task_code: taskId
            })
        });

        const responseData = await response.json();
        console.log('Resposta da atualização de status:', responseData);
        
        if (!responseData.data) {
            throw new Error('Erro ao atualizar status');
        }

        // Recarregar tarefas
        loadTasks();
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status da tarefa');
    }
}

// Funções para o modal de edição
function openEditModal(taskId) {
    const modal = document.getElementById('editModal');
    const form = document.getElementById('editForm');
    const card = document.querySelector(`[data-id="${taskId}"]`);
    
    document.getElementById('taskId').value = taskId;
    document.getElementById('description').value = card.querySelector('.task-description').textContent;
    
    const dueDate = card.querySelector('.task-due-date').dataset.date;
    document.getElementById('dueDate').value = dueDate || '';
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('editModal');
    modal.style.display = 'none';
}

// Configurar modal de edição
document.getElementById('cancelButton').addEventListener('click', closeModal);

// Configurar formulário de edição
document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
        const user = await Auth.currentAuthenticatedUser();
        const { phone_number } = user.attributes;
        const formattedPhone = phone_number.replace(/^\+/, '').replace(/\D/g, '');

        const taskId = document.getElementById('taskId').value;
        const dueDate = document.getElementById('dueDate').value;
        console.log('Data selecionada:', dueDate);

        // Formata a data para YYYY-MM-DD
        const formattedDate = dueDate ? dueDate.split('T')[0] : null;
        console.log('Data formatada:', formattedDate);

        const response = await fetch('https://n8n.autonomia.site/webhook/todo-api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messageType: 'updateTask',
                phone: formattedPhone,
                task_code: taskId,
                due_date: formattedDate
            })
        });

        const responseData = await response.json();
        console.log('Resposta da atualização da tarefa:', responseData);

        if (!responseData.data) {
            throw new Error('Erro ao atualizar tarefa');
        }

        // Fechar modal e recarregar tarefas
        closeModal();
        loadTasks();
    } catch (error) {
        console.error('Erro ao atualizar tarefa:', error);
        alert('Erro ao atualizar tarefa');
    }
});
