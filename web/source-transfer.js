// The external terminal cannot read browser drafts. Match the uploaded bytes
// to the current editor before replacing its project file.
const quote=value=>"'"+value.replaceAll("'","'\\''")+"'";
export async function sourceCommand({code,path,run,directory='/root/work/go-foundry',uploads='/root',tool='/bin/busybox'}){
 if(!path||path.startsWith('/')||path.includes('\0')||path.split('/').includes('..')||!path.endsWith('.go'))throw Error('Choose a project Go source file.');
 const bytes=new TextEncoder().encode(code),digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
 const folder=path.includes('/')?path.slice(0,path.lastIndexOf('/')):'.';
 return 'if cd '+quote(directory)+';then gf_file=;for gf_candidate in '+quote(uploads)+'/*.go;do [ -f "$gf_candidate" ]||continue;case "$('+quote(tool)+' sha256sum "$gf_candidate")" in '+quote(digest+' ')+'*)gf_file="$gf_candidate";break;;esac;done;if [ -n "$gf_file" ];then if gf_temp=$('+quote(tool)+' mktemp '+quote(folder+'/.go-source-XXXXXX')+')&&cp "$gf_file" "$gf_temp"&&mv "$gf_temp" '+quote(path)+';then '+run.replaceAll('\n',';')+';fi;else echo "Upload the current editor file using Choose files below the terminal, then paste this command again.";fi;fi\n';
}
