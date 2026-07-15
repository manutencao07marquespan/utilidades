-- ============================================
-- Atualizar turns e cisternas
-- Portal das Utilidades - ETE
-- ============================================

-- 1. Atualizar CHECK constraint de turns (se existir)
-- Primeiro remover os constraints antigos
DO $$
BEGIN
  -- lab_analyses
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lab_analyses_shift_check') THEN
    ALTER TABLE lab_analyses DROP CONSTRAINT lab_analyses_shift_check;
  END IF;
  ALTER TABLE lab_analyses ADD CONSTRAINT lab_analyses_shift_check CHECK (shift IN ('1A', '1B', '2A', '2B'));

  -- hydrant_readings
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hydrant_readings_shift_check') THEN
    ALTER TABLE hydrant_readings DROP CONSTRAINT hydrant_readings_shift_check;
  END IF;
  ALTER TABLE hydrant_readings ADD CONSTRAINT hydrant_readings_shift_check CHECK (shift IN ('1A', '1B', '2A', '2B'));

  -- well_horimeters
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'well_horimeters_shift_check') THEN
    ALTER TABLE well_horimeters DROP CONSTRAINT well_horimeters_shift_check;
  END IF;
  ALTER TABLE well_horimeters ADD CONSTRAINT well_horimeters_shift_check CHECK (shift IN ('1A', '1B', '2A', '2B'));

  -- cistern_levels
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cistern_levels_shift_check') THEN
    ALTER TABLE cistern_levels DROP CONSTRAINT cistern_levels_shift_check;
  END IF;
  ALTER TABLE cistern_levels ADD CONSTRAINT cistern_levels_shift_check CHECK (shift IN ('1A', '1B', '2A', '2B'));
END $$;

-- 2. Atualizar turns existentes (de A/B/C para 1A/1B/2A/2B)
UPDATE lab_analyses SET shift = '1A' WHERE shift = 'A';
UPDATE lab_analyses SET shift = '1B' WHERE shift = 'B';
UPDATE lab_analyses SET shift = '2A' WHERE shift = 'C';

UPDATE hydrant_readings SET shift = '1A' WHERE shift = 'A';
UPDATE hydrant_readings SET shift = '1B' WHERE shift = 'B';
UPDATE hydrant_readings SET shift = '2A' WHERE shift = 'C';

UPDATE well_horimeters SET shift = '1A' WHERE shift = 'A';
UPDATE well_horimeters SET shift = '1B' WHERE shift = 'B';
UPDATE well_horimeters SET shift = '2A' WHERE shift = 'C';

UPDATE cistern_levels SET shift = '1A' WHERE shift = 'A';
UPDATE cistern_levels SET shift = '1B' WHERE shift = 'B';
UPDATE cistern_levels SET shift = '2A' WHERE shift = 'C';

-- 3. Atualizar cistern codes existentes
UPDATE cistern_levels SET cistern_code = 'BACIA AMORTECIMENTO - 296 M³' WHERE cistern_code = 'EB-01';
UPDATE cistern_levels SET cistern_code = 'CISTERNA LAVAGEM - 320 M³' WHERE cistern_code = 'ET-01';
UPDATE cistern_levels SET cistern_code = 'CISTERNA E. BRUTO - 440 M³' WHERE cistern_code = 'EB-02';
