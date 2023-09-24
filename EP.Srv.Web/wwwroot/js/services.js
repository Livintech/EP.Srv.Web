angular.module('EP')
    .service('AuthService', function ($http, constants, toaster, $timeout, $localStorage, $loading) {

        var pars = {
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": constants.UrlAuthApi,
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            }
        }

        this.logar = function (obj) {
            $loading.start('load');

            return $http.post(constants.UrlAuthApi + 'Auth/Login', obj, pars)
                .then(function (response) {
                    return response;
                });
        }

        this.RedefinirSenha = function (obj) {
            $http.post(constants.UrlAuthApi + 'Auth/RedefintionPassword', obj)
                .then(function (response) {
                    if (response.data.success) {

                        toaster.pop({
                            type: 'success',
                            title: 'Sucesso',
                            body: response.data.message,
                            showCloseButton: true,
                            timeout: 5000
                        });

                        $localStorage.$reset();
                        $localStorage.user = response.data;

                        $timeout(function () {
                            window.location = "#/login";
                        }, 5000);
                    }
                    else {
                        $localStorage.error = response.data.message;

                        toaster.pop({
                            type: 'error',
                            title: 'Error',
                            body: response.data.message,
                            showCloseButton: true,
                            timeout: 5000
                        });
                    }
                }, function (error) {
                    $loading.finish('load');
                    angular.forEach(error.data, function (value, index) {
                        toaster.pop({
                            type: 'error',
                            title: value.propertyName,
                            body: value.errorMessage,
                            showCloseButton: true,
                            timeout: 5000
                        });
                    });
                });
        }

    })
    .service('UsuarioService', function ($http, constants, $localStorage) {

        var params = { headers: { 'Authorization': '' } };

        this.GetUsers = function (obj) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlAuthApi + 'User/GetUserAll', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.EditUser = function (obj) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlAuthApi + 'User/EditUser', obj, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.cadastrar = function (obj) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlAuthApi + 'User/CreateUser', obj, params)
                .then(function (response) {
                    return response
                });
        }

    })
    .service('ClienteService', function ($http, constants, $localStorage) {

        var params = { headers: { 'Authorization': '' } };

        this.CadastrarCliente = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Cliente/Cadastrar', objJson, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.ObterEmpresas = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Cliente/ListarEmpresas', objJson, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.ObterCLientes = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Cliente/ListarClientes', objJson, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.AtualizarCliente = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Cliente/Atualizar', objJson, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

        this.AtualizarEmpresa = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Cliente/AtualizarEmpresa', objJson, params)
                .then(function (response) {
                    return response.data;
                }, function (error) {
                    angular.forEach(error.data, function (value, index) {
                        return value;
                    });
                });
        }

    })
    .service('BancoService', function ($http, constants, $localStorage) {
        var params = { headers: { 'Authorization': '' } };

        this.ListarBancos = function (obj) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Bancos/Listar', obj , params)
                .then(function (response) {
                    return response.data;
                });
        }

        this.GravarDadosBanco = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Bancos/Cadastrar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }

        this.AtualizarDadosBanco = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Bancos/Atualizar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }
    })
    .service('FormaPagamentoService', function ($http, constants, $localStorage) {
        var params = { headers: { 'Authorization': '' } };

        this.GravarDadosPagamento = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Pagamentos/Cadastrar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }

        this.ObterListaPagamentos = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Pagamentos/Listar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }

        this.AtualizaPagamento = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'Pagamentos/Atualizar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }
    })
    .service('ProdutosServicosService', function ($http, constants, $localStorage) {
        var params = { headers: { 'Authorization': '' } };

        this.GravarDadosProdutos = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'ProdutosServicos/Cadastrar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        };

        this.ListarProdutosServicos = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'ProdutosServicos/Listar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        };

        this.AtualizaProdutoServico = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'ProdutosServicos/Atualizar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        };
    })
    .service('PlanoContasService', function ($http, constants, $localStorage) {
        var params = { headers: { 'Authorization': '' } };

        this.GravarPlanoContas = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'PlanoDeContas/Cadastrar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }

        this.ListarPlanoContas = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'PlanoDeContas/Listar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }

        this.AtualizarPlanoContas = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'PlanoDeContas/Atualizar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }
    })
    .service('CentroCustoService', function ($http, constants, $localStorage) {
        var params = { headers: { 'Authorization': '' } };

        this.GravarCentroCusto = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'CentroDeCustos/Cadastrar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }

        this.AtualizarCentroCusto = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'CentroDeCustos/Atualizar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }

        this.ListarCentroCustos = function (objJson) {
            params.headers.Authorization = 'Bearer ' + $localStorage.user.acessToken;

            return $http.post(constants.UrlClienteApi + 'CentroDeCustos/Listar', objJson, params)
                .then(function (response) {
                    return response.data;
                });
        }
    })
