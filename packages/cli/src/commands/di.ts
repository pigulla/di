import {GluegunCommand} from 'gluegun'

const di_command: GluegunCommand = {
    name: 'di',
    run: async toolbox => {
        const {print} = toolbox

        print.info('Welcome to your CLI')
    },
}

export default di_command
