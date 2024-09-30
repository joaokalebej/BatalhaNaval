var Game = Game || (function() {
    // Variáveis privadas do jogo
    var _bombs = 0; // Contador de tentativas
    var _hits = 0; // Contador de acertos
    var _ships = {}; // Armazena a posição dos navios
    var _letters = "ABCDEFGHIJ"; // Letras para as linhas
    var $rows = {}; // Referência às linhas da tabela

    // Função para iniciar o jogo
    function start() {
        var title = document.title; // Armazena o título atual da página
        interval = setInterval(function(){
            // Alterna o título da página durante o carregamento
            if (document.title.length === 11) {
                document.title = 'Carregando..';
            }
            else if (document.title.length === 12) {
                document.title = 'Carregando...';
            }
            else {
                document.title = 'Carregando.';
            }
        }, 500);
        set_table(); // Configura o tabuleiro
        set_coords(); // Define as coordenadas nas células
        set_events(); // Adiciona eventos de interação
        set_ships(); // Posiciona os navios
        play_sound('melody', .25); // Toca a melodia inicial
        clearInterval(interval); // Para o intervalo de carregamento
        document.title = title; // Restaura o título original
    }

    // Função para criar a tabela do jogo
    function set_table() {
        $table = $('<table></table>'); // Cria uma nova tabela
        for (x = 0; x < 10; x++) {
            $tr = $('<tr></tr>'); // Cria uma nova linha
            for (z = 0; z < 10; z++) {
                $td = $('<td></td>'); // Cria uma nova célula
                $tr.append($td); // Adiciona a célula à linha
            }
            $table.append($tr); // Adiciona a linha à tabela
        }
        $('#game').html($table); // Insere a tabela no elemento #game
    }

    // Função para definir as coordenadas nas células
    function set_coords() {
        $rows = $('#game table tr'); // Seleciona as linhas da tabela
        for (x = 0, length = $rows.length; x < length; x++) {
            $rows.eq(x).attr('data-row', _letters[x]); // eq é usado para selecionar um elemento específico de um conjunto de elementos. retorna o elemento indicado pelo índice.
            var $cols = $rows.eq(x).find('td'); // Seleciona as células da linha
            for (y = 0, length = $cols.length; y < length; y++) {
                $cols.eq(y).attr('data-col', (y + 1)); // Atribui o número à coluna
                $cols.eq(y).attr('title', 'Jogar bomba em ' + _letters[x] +  (y + 1)); // Define um título para a célula
            }
        }
    }

    // Função para adicionar eventos às células
    function set_events() {
        $('#game table td').off('click').click(function() {
            var $this = $(this); // Referência à célula clicada
            var row = $this.parent().data('row'); // Obtém a linha -- $(this).parent() refere-se ao elemento pai da célula clicada
            var col = $this.data('col'); // Obtém a coluna
            attack($this, row, col); // Chama a função de ataque
        });
        $('#game table td').off('hover').hover(function() {
            play_sound('click'); // Toca o som de clique ao passar o mouse
        });
        $('#sound-checkbox input').off('change').change(function() {
            // Gerencia o som baseado na checkbox
            if (!$(this).is(':checked')) {
                var $audios = $('audio'); // Seleciona todos os elementos de áudio
                for (var i = 0, length = $audios.length; i < length; i++) {
                    $audios.get(i).pause(); // Pausa todos os sons
                }
            }
            else if (_hits < 17) {
                play_sound('melody'); // Toca a melodia se o jogo não terminou
            }
        });
    }

    // Função para posicionar os navios
    function set_ships() {
        set_ship(5); // Define um navio de tamanho 5
        set_ship(4); // Define um navio de tamanho 4
        set_ship(3); // Define dois navios de tamanho 3
        set_ship(3);
        set_ship(2); // Define um navio de tamanho 2
    }

    // Função que verifica se um navio pode ser posicionado
    function can_set_ship(length) {
        var _great = true; // Variável para verificar se a posição é válida
        var _row, _col, _orientation, _direction;

        _orientation = random(1, 2); // Define a orientação aleatoriamente (1: vertical, 2: horizontal)
        _row = random(1, 10); // Gera uma linha aleatória
        _col = random(1, 10); // Gera uma coluna aleatória

        // Lógica para verificar a posição do navio verticalmente
        if (_orientation === 1) {
            while (!(_row - 10 >= length) && !(_row >= length)) {
                _row = random(1, 10); // Gera uma nova linha se a posição não for válida
            }

            if ((_row >= length) && (_row - 10 >= length)) {
                _direction = random(1, 2); // Define a direção aleatoriamente
            }
            else if (_row >= length) {
                _direction = 1; // Para cima
            }
            else {
                _direction = 2; // Para baixo
            }

            row = _row;
            col = _col;

            // Verifica se a posição para cima ou para baixo está ocupada
            if (_direction === 1) { // Para cima
                for (x = 0; x < length; x++) {
                    if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
                        _great = false; // Posição inválida
                    }
                    row--;
                }
            }
            else { // Para baixo
                for (x = 0; x < length; x++) {
                    if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
                        _great = false; // Posição inválida
                    }
                    row++;
                }
            }
        }
        else { // Lógica para verificar horizontalmente
            while (!(_col - 10 >= length) && !(_col >= length)) {
                _col = random(1, 10); // Gera nova coluna se não for válida
            }

            if ((_col >= length) && (_col - 10 >= length)) {
                _direction = random(1, 2);
            }
            else if (_col >= length) {
                _direction = 1; // Para esquerda
            }
            else {
                _direction = 2; // Para direita
            }

            row = _row;
            col = _col;

            // Verifica se a posição para a esquerda ou direita está ocupada
            if (_direction === 1) { // Para esquerda
                for (x = 0; x < length; x++) {
                    if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
                        _great = false; // Posição inválida
                    }
                    col--;
                }
            }
            else { // Para direita
                _ships[_letters[_row - 1]] = {};
                for (x = 0; x < length; x++) {
                    if (_ships[_letters[row - 1]] && _ships[_letters[row - 1]][col]) {
                        _great = false; // Posição inválida
                    }
                    col++;
                }
            }
        }

        // Retorna as coordenadas se a posição for válida, senão chama a função novamente
        if (_great) {
            return {
                'row': _row,
                'col': _col,
                'orientation': _orientation,
                'direction': _direction
            };
        }
        else {
            return can_set_ship(length);
        }
    }

    // Função que posiciona o navio
    function set_ship(length) {
        var data = can_set_ship(length); // Obtém dados da posição válida

        var row = data['row'];
        var col = data['col'];
        var orientation = data['orientation'];
        var direction = data['direction'];

        // Posiciona o navio verticalmente
        if (orientation === 1) {
            if (direction === 1) { // Para cima
                for (x = 0; x < length; x++) {
                    _ships[_letters[row - 1]] = _ships[_letters[row - 1]] || {};
                    _ships[_letters[row - 1]][col] = true; // Marca a posição como ocupada
                    row--;
                }
            }
            else { // Para baixo
                for (x = 0; x < length; x++) {
                    _ships[_letters[row - 1]] = _ships[_letters[row - 1]] || {};
                    _ships[_letters[row - 1]][col] = true; // Marca a posição como ocupada
                    row++;
                }
            }
        }
        else { // Posiciona o navio horizontalmente
            if (direction === 1) { // Para esquerda
                _ships[_letters[row - 1]] = _ships[_letters[row - 1]] || {};
                for (x = 0; x < length; x++) {
                    _ships[_letters[row - 1]][col] = true; // Marca a posição como ocupada
                    col--;
                }
            }
            else { // Para direita
                _ships[_letters[_row - 1]] = _ships[_letters[_row - 1]] || {};
                for (x = 0; x < length; x++) {
                    _ships[_letters[row - 1]][col] = true; // Marca a posição como ocupada
                    col++;
                }
            }
        }
    }

    // Função que gera um número aleatório entre start e end
    function random(start, end) {
        return Math.floor((Math.random() * end) + start);
    }

    // Função para atacar uma célula do tabuleiro
    function attack($cell, row, column) {
        $cell.off('click'); // Remove o evento de clique da célula
        _bombs++; // Incrementa o contador de tentativas
        if (_ships[row] && _ships[row][column]) {
            $cell.css('background-color', 'black'); // Marca como navio atingido
            $cell.attr('title', 'Você acertou um navio em ' + row + column); // Mensagem de acerto
            _hits++; // Incrementa o contador de acertos
            play_sound('hit'); // Toca o som de acerto
        }
        else {
            $cell.css('background-color', '#0D47A1'); // Marca como água
            $cell.attr('title', 'Você já jogou uma bomba em ' + row + column); // Mensagem de tentativa anterior
            play_sound('miss'); // Toca o som de erro
        }

        check_game_over(); // Verifica se o jogo acabou
    }

    // Função que verifica se o jogo terminou
    function check_game_over() {
        if (_hits === 17) { // Se todos os navios foram atingidos
            $('audio#melody').get(0).pause(); // Pausa a música
            play_sound('win'); // Toca o som de vitória
            // Pergunta se o jogador deseja reiniciar
            if (confirm('Você ganhou com ' + ((_hits/_bombs) * 100).toFixed() + '% de taxa de acerto.\nTentativas: '+_bombs+'\nAcertos: '+_hits+'\nDeseja iniciar um novo jogo?')) {
                location.reload(); // Recarrega a página para reiniciar o jogo
            }
            $('#game td').off('click mouseenter mouseleave'); // Desativa eventos
        }
    }

    // Função para tocar sons
    function play_sound(id, volume) {
        if ($('#sound-checkbox input').is(':checked')) { // Verifica se o som está ativado
            var sound = $('audio#' + id).get(0); // Obtém o elemento de áudio
            if (volume) {
                sound.volume = volume; // Define o volume se especificado
            }
            sound.pause(); // Pausa o som
            sound.currentTime = 0; // Reseta o tempo do som
            sound.play(); // Toca o som
        }
    }

    return {
        start: start // Retorna a função start para ser acessível externamente
    }
})();

// Inicia o jogo
Game.start();
