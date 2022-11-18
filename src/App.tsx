import { Fragment, useState, useEffect } from 'react';
import { JsonForms } from '@jsonforms/react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import './App.css';
import {
  materialCells,
  materialRenderers,
} from '@jsonforms/material-renderers';
import RatingControl from './RatingControl';
import ratingControlTester from './ratingControlTester';
import { makeStyles } from '@mui/styles';
import { TextareaAutosize } from '@mui/material';

const useStyles = makeStyles({
  container: {
    padding: '1em',
    width: '100%',
  },
  title: {
    textAlign: 'center',
    padding: '0.25em',
  },
  dataContent: {
    display: 'flex',
    justifyContent: 'center',
    borderRadius: '0.25em',
    backgroundColor: '#fafafa',
    marginBottom: '1rem',
  },
  resetButton: {
    margin: 'auto !important',
    display: 'block !important',
  },
  demoform: {
    margin: 'auto',
    padding: '1rem',
  },
});

const initialData = {
  name: 'Send email to Adrian',
  description: 'Confirm if you have passed the subject\nHereby ...',
  done: true,
  recurrence: 'Daily',
  rating: 3,
};

const renderers = [
  ...materialRenderers,
  //register custom renderers
  { tester: ratingControlTester, renderer: RatingControl },
];

const getData = async (id: string) => {
  const res = await fetch(`http://localhost:3000/back-office/dto/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  return res.json();
};

const getDtoIds = async () => {
  const res = await fetch(`http://localhost:3000/back-office/dto/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  return res.json();
};

const App = () => {
  const classes = useStyles();
  const [currentDto, setCurrentDto] = useState(0);
  const [dtoIds, setDtoIds] = useState<string[]>([]);
  const [data, setData] = useState<any>(initialData);
  const [schemas, setSchemas] = useState<any>({});

  useEffect(() => {
    getDtoIds().then((dtoIds) => {
      console.log({ dtoIds });
      setDtoIds(dtoIds);
    });
  }, []);

  useEffect(() => {
    if (dtoIds.length) {
      getData(dtoIds[currentDto]).then(({ validationScheme, uiScheme }) => {
        console.log({ validationScheme, uiScheme });
        setSchemas({ schema: validationScheme, uischema: uiScheme });
      });
    }
  }, [dtoIds, currentDto]);

  return (
    <Fragment>
      <nav>
        <Typography variant='h4' className={classes.title}>
          JSON Forms - Material Renderers
        </Typography>
        {dtoIds.map((id, index) => (
          <Button
            style={{ textTransform: 'none' }}
            onClick={() => setCurrentDto(index)}
          >
            {id}
          </Button>
        ))}
      </nav>
      <Grid
        container
        justifyContent={'center'}
        spacing={1}
        className={classes.container}
      >
        <Grid item sm={6}>
          <Typography variant={'h4'} className={classes.title}>
            Schema
          </Typography>
          <TextareaAutosize
            className={classes.dataContent}
            value={JSON.stringify(schemas.schema, null, 2)}
            style={{ width: '80%', margin: '2rem' }}
          />
        </Grid>
        <Grid item sm={6}>
          <Typography variant={'h4'} className={classes.title}>
            Rendered form
          </Typography>
          {schemas?.schema && schemas?.uischema ? (
            <div className={classes.demoform}>
              <JsonForms
                schema={schemas.schema}
                uischema={schemas.uischema}
                data={data[currentDto]}
                renderers={renderers}
                cells={materialCells}
                onChange={({ errors, data }) => {
                  console.log(data);
                  setData({ [currentDto]: data });
                }}
              />
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </Grid>
      </Grid>
    </Fragment>
  );
};

export default App;
