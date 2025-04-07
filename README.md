# App

Picpay challange

## RFs (Requisitos funcionais)

- [x] O sistema deve permitir o cadastro de dois tipos de usuários: comuns e lojistas.
- [x] O cadastro deve exigir os seguintes dados obrigatórios; Nome, CPF ou CNPJ, E-mail, senha
- [x] O sistema deve garantir que CPF/CNPJ e e-mail sejam únicos, impedindo cadastros duplicados.
- [x]Usuários comuns podem realizar transferências de dinheiro para; Usuários comuns ou lojistas
- [x] Usuários lojistas apenas recebem transferências, não podem enviar dinheiro.
- [x] Antes de uma transferência, o sistema deve; Verificar se o usuário possui saldo suficiente, Consultar o serviço autorizador externo via GET:
https://util.devi.tools/api/v2/authorize
- [x] A transferência deve ser uma transação atômica
- [x]Após o recebimento do valor, o destinatário (usuário ou lojista) deve receber uma notificação via um serviço externo:
- [x] O sistema deve expor suas funcionalidades por meio de uma API RESTful.


## RNs (Regras de negócio)

- [x] Apenas usuários comuns podem enviar dinheiro
Lojistas não podem enviar, apenas receber
- [x] Deve-se verificar saldo suficiente antes da transferência
Deve-se consultar o autorizador externo antes de confirmar a operação
- [x] A transferência deve ser atômica e reversível em caso de falhas
- [x] Após a transferência, o destinatário deve ser notificado via serviço externo



