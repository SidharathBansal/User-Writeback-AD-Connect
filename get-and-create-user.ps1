connect-azuread #Log-in with the user with enough privileges to get and create users

$users = Get-AzureADUser -All $true | Where-Object { -not $_.ImmutableId }

$password = ConvertTo-SecureString "<Strong Password>" -AsPlainText -Force

foreach($user in $users) {
    New-ADUser -Name $user.MailNickName `
    -DisplayName $user.DisplayName  `
    -SamAccountName $user.MailNickName  `
    -UserPrincipalName $user.UserPrincipalName `
    -AccountPassword $password -Enabled $true
}

start-adsyncsynccycle -policytype delta # This command should be run on the server where Azure AD Connect is installed